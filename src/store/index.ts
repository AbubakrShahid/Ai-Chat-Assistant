import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import storage from "./storage";
import chatReducer from "./chat-slice";

const rootReducer = combineReducers({
  chat: chatReducer,
});

type RootReducerState = ReturnType<typeof rootReducer>;

const persistConfig = {
  key: "ai-chat-app",
  version: 2,
  storage,
  whitelist: ["chat"] as string[],
  stateReconciler: autoMergeLevel2 as (
    inbound: RootReducerState,
    original: RootReducerState,
    reduced: RootReducerState
  ) => RootReducerState,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
