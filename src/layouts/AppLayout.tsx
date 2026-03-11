import { Outlet } from "react-router-dom";
import BottomTabBar from "@/components/BottomTabBar";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background dark">
      <div className="pb-20">
        <Outlet />
      </div>
      <BottomTabBar />
    </div>
  );
};

export default AppLayout;
