import { IUser } from "@/commons/interfaces/users";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IInitialState {
  users: IUser[];
  token: string | null;
  user: Partial<IUser> | null;
  loading: boolean;
}

const initialState: IInitialState = {
  users: [],
  token: null,
  user: null,
  loading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<IUser[]>) {
      state.users = action.payload;
    },
    setUser(state, action: PayloadAction<Partial<IUser>>) {
      state.user = action.payload;
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    deleteUser(state, action: PayloadAction<number>) {
      state.users = state.users.filter((user) => user.id !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    updateUser(state, action: PayloadAction<IUser>) {
      const index = state.users.findIndex(
        (user) => user.id === action.payload.id
      );

      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
  },
});

export const {
  setUsers,
  deleteUser,
  updateUser,
  setToken,
  setUser,
  setLoading,
} = userSlice.actions;
export default userSlice.reducer;
