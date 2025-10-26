where we will stores for states if we decide to use state manager like zustland instead of usestate in rect
example store 
translation from react [userInpyut, setUserinpu] = usesteate(string[])
better imo because states can be accessed in any tsx and ts file and its easier to manager than global context
```tsx
import { create } from "zustand";

interface UserInputProps {
  userInput: string[]
  setUserInput: (newUserInput: string[]) => void
}


export const useUserInputStore = create<UserInputProps>((set) => ({
    userInput: [""],
    setUserInput: (newUserInput) => set({ userInput : newUserInput }),
}))
```