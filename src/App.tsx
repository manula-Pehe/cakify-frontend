import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
            {/* No Routes configured Yet */}
        </Routes>
      </BrowserRouter>
  </QueryClientProvider>
);

export default App;
