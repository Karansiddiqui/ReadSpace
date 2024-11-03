import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  error: null,
  cartLoading: false,
  cartItems: null,
};

const cartSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addToCartStart: (state) => {
      state.cartLoading = true;
      state.error = null;
    },
    addToCartSuccess: (state, action) => {
      state.cartLoading = false;
      state.cartItems = action.payload;
      state.error = null;
    },
    addToCartFailure: (state, action) => {
      state.cartLoading = false;
      state.error = action.payload;
    },

    removeItemFromCartStart: (state) => {
      state.cartLoading = true;
      state.error = null;
    },
    removeItemFromCartSuccess: (state, action) => {
      state.cartLoading = false;
      state.error = null;
      console.log("action.payload", action.payload);

      state.cartItems.cartItem = state.cartItems.cartItem.filter(
        (item) => item._id !== action.payload
      );
    },
    removeItemFromCartFailure: (state, action) => {
      state.cartLoading = false;
      state.error = action.payload;
    },
    clearCartStart: (state) => {
      state.cartLoading = true;
      state.error = null;
    },
    clearCartSuccess: (state) => {
      state.cartLoading = false;
      state.error = null;
      state.cartItems = null;
    },
    clearCartFailure: (state, action) => {
      state.cartLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  addToCartFailure,
  addToCartStart,
  addToCartSuccess,
  removeItemFromCartStart,
  removeItemFromCartSuccess,
  removeItemFromCartFailure,
  clearCartFailure,
  clearCartStart,
  clearCartSuccess,
} = cartSlice.actions;

export default cartSlice.reducer;
