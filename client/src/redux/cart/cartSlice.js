import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  error: null,
  loading: false,
  cartItems: { cartItem: [] },
};

const cartSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addToCartStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    addToCartSuccess: (state, action) => {
        console.log("Action here", action.payload);
        
      state.loading = false;
      state.cartItems.cartItem = action.payload.cartItem;
      state.error = null;
    },
    addToCartFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  addToCartFailure,
  addToCartStart,
  addToCartSuccess,
} = cartSlice.actions;

export default cartSlice.reducer;
