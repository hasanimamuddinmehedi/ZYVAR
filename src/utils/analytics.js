import ReactGA
from "react-ga4";

export const initAnalytics =
  () => {

    ReactGA.initialize(

      import.meta.env
        .VITE_GA_ID
    );
};

export const trackPage =
  (path) => {

    ReactGA.send({

      hitType:
        "pageview",

      page:
        path,
    });
};

export const trackEvent =
  (
    category,
    action,
    label
  ) => {

    ReactGA.event({

      category,
      action,
      label,
    });
};