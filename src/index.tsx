import {
  definePlugin,
  ServerAPI,
  staticClasses,
} from "decky-frontend-lib";
import { FaShip } from "react-icons/fa";


import PriceComparison from "./components/PriceComparison";
import DeckyMenuOption from "./components/DeckyMenuOption";
import { patchStore } from "./patches/StorePatch";
import { Cache } from "./utils/Cache";
import { IsThereAnyDealService } from "./service/IsThereAnyDealService";
import { Settings } from "./utils/Settings";


export default definePlugin((serverApi: ServerAPI) => {
  
  Cache.init()
  Settings.init(serverApi)
  IsThereAnyDealService.init(serverApi)

  serverApi.routerHook.addGlobalComponent("PriceComparison", PriceComparison )

  const storePatch = patchStore(serverApi)


  return {
    title: <div className={staticClasses.Title}>IsThereAnyDeal</div>,
    content: <DeckyMenuOption serverAPI={serverApi}/>,
    icon: <FaShip />,
    onDismount() {
      serverApi.routerHook.removeGlobalComponent("PriceComparison")
      storePatch
    },
  };
});
