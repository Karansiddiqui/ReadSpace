import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";
import themeReducer from "./theme/themeSlice";
import cartReducer from "./cart/cartSlice";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import expireReducer from "redux-persist-expire";

const rootReducer = combineReducers({
  user: userReducer,
  theme: themeReducer,
  cart: cartReducer
});

const persistConfig = {
  key: "root",
  storage,
  version: 1,
  transforms: [
    expireReducer("user", {
      expireSeconds: 86400,
      expiredState: {
        viewType: "list",
        token: "",
      },
      autoExpire: true,
    }),
    expireReducer("theme", {
      expireSeconds: 86400,
      expiredState: {
        viewType: "list",
        token: "",
      },
      autoExpire: true,
    }),
  ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
