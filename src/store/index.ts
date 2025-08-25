import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import accountReducer from './accountSlice';
import transactionsReducer from './transactionsSlice';


export const store = configureStore({
reducer: {
auth: authReducer,
account: accountReducer,
transactions: transactionsReducer,
},
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;