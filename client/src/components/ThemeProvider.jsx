import { useSelector } from "react-redux";
export default function ThemeProvider({ children }) {
  const { theme } = useSelector((state) => state.theme);
  return (
    <div className={theme}>
      <div className="bg-slate-50 text-grey-700  dark:text-gray-200 dark:bg-[rgb(1,4,9)] min-h-screen">
        {children}
      </div>
    </div>
  );
}
