import { sdk, hasBridge } from "./useSdk";
import { toNumber } from "./useNumber";

export const applySystemInsets = () => {
  const statusBarHeight =
    sdk && hasBridge("DtGetStatusBarHeight")
      ? toNumber(sdk.android.getStatusBarHeight())
      : null;
  const navigationHeight =
    sdk && hasBridge("DtGetNavigationBarHeight")
      ? toNumber(sdk.android.getNavigationBarHeight())
      : null;
  const topOffset =
    statusBarHeight && statusBarHeight > 0
      ? Math.min(statusBarHeight, 64)
      : 0;
  const bottomOffset =
    navigationHeight && navigationHeight > 0
      ? Math.min(navigationHeight, 64)
      : 0;
  document.documentElement.style.setProperty(
    "--statusbar-offset",
    `${topOffset}px`,
  );
  document.documentElement.style.setProperty(
    "--navigation-offset",
    `${bottomOffset}px`,
  );
};
