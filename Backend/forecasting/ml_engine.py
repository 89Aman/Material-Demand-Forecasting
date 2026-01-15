import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_absolute_percentage_error
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX
import xgboost as xgb
from prophet import Prophet
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class DemandForecaster:
    """Main forecasting engine with multiple algorithms"""


    def __init__(self, historical_data_df):
        """
        historical_data_df: DataFrame with columns [date, quantity_demanded, ... external factors]
        """
        self.data = historical_data_df.sort_values('date').reset_index(drop=True)
        self.scaler = StandardScaler()
        
    def prepare_features(self):
        """Prepare features for ML models"""
        df = self.data.copy()
        
        # Add lag features
        df['lag_1'] = df['quantity_demanded'].shift(1)
        df['lag_7'] = df['quantity_demanded'].shift(7)
        df['lag_30'] = df['quantity_demanded'].shift(30)
        
        # Add rolling statistics
        df['rolling_mean_7'] = df['quantity_demanded'].rolling(7).mean()
        df['rolling_std_7'] = df['quantity_demanded'].rolling(7).std()
        df['rolling_mean_30'] = df['quantity_demanded'].rolling(30).mean()
        
        # Add trend
        df['day_of_week'] = pd.to_datetime(df['date']).dt.dayofweek
        df['day_of_month'] = pd.to_datetime(df['date']).dt.day
        df['month'] = pd.to_datetime(df['date']).dt.month
        df['quarter'] = pd.to_datetime(df['date']).dt.quarter
        
        # Drop NaN values
        df = df.dropna()
        
        return df

    def forecast_arima(self, horizon_days=30):
        """ARIMA forecasting - good for univariate time series"""
        try:
            y = self.data['quantity_demanded'].values
            
            # Auto-fit ARIMA (5,1,2) typically works well
            model = ARIMA(y, order=(5, 1, 2))
            fitted_model = model.fit()
            
            # Forecast
            forecast = fitted_model.get_forecast(steps=horizon_days)
            forecast_df = forecast.summary_frame()
            
            # Calculate error metrics on last 30 days (validation)
            validation_actual = y[-30:]
            validation_pred = fitted_model.fittedvalues[-30:]
            
            mae = mean_absolute_error(validation_actual, validation_pred)
            rmse = np.sqrt(mean_squared_error(validation_actual, validation_pred))
            mape = mean_absolute_percentage_error(validation_actual, validation_pred)
            accuracy = max(0, 100 - (mape * 100))
            
            return {
                'forecast': forecast_df['mean'].values,
                'lower_bound': forecast_df['mean_ci_lower'].values,
                'upper_bound': forecast_df['mean_ci_upper'].values,
                'mae': mae,
                'rmse': rmse,
                'mape': mape,
                'accuracy': accuracy,
            }
        except Exception as e:
            logger.error(f"ARIMA forecast error: {str(e)}")
            raise

    def forecast_xgboost(self, horizon_days=30):
        """XGBoost with multiple features"""
        try:
            df = self.prepare_features()
            
            feature_cols = ['lag_1', 'lag_7', 'lag_30', 'rolling_mean_7', 'rolling_std_7', 
                        'rolling_mean_30', 'day_of_week', 'day_of_month', 'month', 'quarter']
            
            X = df[feature_cols].values
            y = df['quantity_demanded'].values
            
            # Split train/test (80/20)
            split_idx = int(len(X) * 0.8)
            X_train, X_test = X[:split_idx], X[split_idx:]
            y_train, y_test = y[:split_idx], y[split_idx:]
            
            # Train XGBoost
            model = xgb.XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42)
            model.fit(X_train, y_train)
            
            # Predict on test set for validation
            y_pred = model.predict(X_test)
            
            mae = mean_absolute_error(y_test, y_pred)
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            mape = mean_absolute_percentage_error(y_test, y_pred)
            accuracy = max(0, 100 - (mape * 100))
            
            # Forecast future
            # Use last available features pattern and repeat for future
            last_features = X[-1].copy()
            forecasts = []
            
            for i in range(horizon_days):
                pred = model.predict([last_features])
                forecasts.append(max(0, pred))
                # Update features for next iteration (simplified)
                last_features[-1] = (i + 1) % 365  # Day progression
            
            # Confidence intervals (simplified: ±20%)
            forecasts_arr = np.array(forecasts)
            lower_bound = forecasts_arr * 0.8
            upper_bound = forecasts_arr * 1.2
            
            return {
                'forecast': forecasts_arr,
                'lower_bound': lower_bound,
                'upper_bound': upper_bound,
                'mae': mae,
                'rmse': rmse,
                'mape': mape,
                'accuracy': accuracy,
            }
        except Exception as e:
            logger.error(f"XGBoost forecast error: {str(e)}")
            raise

    def forecast_prophet(self, horizon_days=30):
        """Prophet forecasting - good for seasonality"""
        try:
            df = self.data[['date', 'quantity_demanded']].copy()
            df.columns = ['ds', 'y']
            df['ds'] = pd.to_datetime(df['ds'])
            
            model = Prophet(yearly_seasonality=True, weekly_seasonality=True, daily_seasonality=False)
            model.fit(df)
            
            future = model.make_future_dataframe(periods=horizon_days)
            forecast = model.predict(future)
            
            # Validation metrics
            last_30_actual = df['y'].tail(30).values
            last_30_pred = forecast['yhat'].iloc[-60:-30].values
            
            mae = mean_absolute_error(last_30_actual, last_30_pred)
            rmse = np.sqrt(mean_squared_error(last_30_actual, last_30_pred))
            mape = mean_absolute_percentage_error(last_30_actual, last_30_pred)
            accuracy = max(0, 100 - (mape * 100))
            
            # Get future predictions
            future_forecast = forecast.tail(horizon_days)
            
            return {
                'forecast': future_forecast['yhat'].values,
                'lower_bound': future_forecast['yhat_lower'].values,
                'upper_bound': future_forecast['yhat_upper'].values,
                'mae': mae,
                'rmse': rmse,
                'mape': mape,
                'accuracy': accuracy,
            }
        except Exception as e:
            logger.error(f"Prophet forecast error: {str(e)}")
            raise

    def forecast_moving_average(self, window=7, horizon_days=30):
        """Simple moving average baseline"""
        try:
            y = self.data['quantity_demanded'].values
            moving_avg = np.convolve(y, np.ones(window)/window, mode='valid')
            
            # Repeat last moving average for future
            last_avg = moving_avg[-1]
            forecast = np.full(horizon_days, last_avg)
            
            # Confidence intervals (±15%)
            lower_bound = forecast * 0.85
            upper_bound = forecast * 1.15
            
            # Validation metrics
            val_actual = y[-30:]
            val_pred = moving_avg[-30:]
            
            mae = mean_absolute_error(val_actual, val_pred)
            rmse = np.sqrt(mean_squared_error(val_actual, val_pred))
            mape = mean_absolute_percentage_error(val_actual, val_pred)
            accuracy = max(0, 100 - (mape * 100))
            
            return {
                'forecast': forecast,
                'lower_bound': lower_bound,
                'upper_bound': upper_bound,
                'mae': mae,
                'rmse': rmse,
                'mape': mape,
                'accuracy': accuracy,
            }
        except Exception as e:
            logger.error(f"Moving average forecast error: {str(e)}")
            raise

    def forecast_ensemble(self, horizon_days=30):
        """Combine multiple forecasts using weighted average"""
        try:
            results = {}
            
            # Get individual forecasts
            try:
                results['arima'] = self.forecast_arima(horizon_days)
            except Exception as e:
                logger.warning(f"ARIMA failed: {e}")
                
            try:
                results['xgboost'] = self.forecast_xgboost(horizon_days)
            except Exception as e:
                logger.warning(f"XGBoost failed: {e}")
                
            try:
                results['prophet'] = self.forecast_prophet(horizon_days)
            except Exception as e:
                logger.warning(f"Prophet failed: {e}")
            
            if not results:
                raise Exception("All ensemble methods failed")
            
            # Weighted average ensemble (weight by accuracy)
            accuracies = [r['accuracy'] for r in results.values()]
            total_accuracy = sum(accuracies)
            weights = [acc / total_accuracy for acc in accuracies]
            
            ensemble_forecast = np.zeros(horizon_days)
            ensemble_lower = np.zeros(horizon_days)
            ensemble_upper = np.zeros(horizon_days)
            
            for (name, result), weight in zip(results.items(), weights):
                ensemble_forecast += result['forecast'] * weight
                ensemble_lower += result['lower_bound'] * weight
                ensemble_upper += result['upper_bound'] * weight
            
            # Average metrics
            avg_mae = np.mean([r['mae'] for r in results.values()])
            avg_rmse = np.mean([r['rmse'] for r in results.values()])
            avg_mape = np.mean([r['mape'] for r in results.values()])
            avg_accuracy = np.mean([r['accuracy'] for r in results.values()])
            
            return {
                'forecast': ensemble_forecast,
                'lower_bound': ensemble_lower,
                'upper_bound': ensemble_upper,
                'mae': avg_mae,
                'rmse': avg_rmse,
                'mape': avg_mape,
                'accuracy': avg_accuracy,
            }
        except Exception as e:
            logger.error(f"Ensemble forecast error: {str(e)}")
            raise

    def forecast(self, algorithm='ensemble', horizon_days=30):
        """Main forecast method"""
        if algorithm == 'arima':
            return self.forecast_arima(horizon_days)
        elif algorithm == 'xgboost':
            return self.forecast_xgboost(horizon_days)
        elif algorithm == 'prophet':
            return self.forecast_prophet(horizon_days)
        elif algorithm == 'moving_avg':
            return self.forecast_moving_average(horizon_days=horizon_days)
        elif algorithm == 'ensemble':
            return self.forecast_ensemble(horizon_days)
        else:
            raise ValueError(f"Unknown algorithm: {algorithm}")