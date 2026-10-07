import { IonApp, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route, Switch } from "react-router-dom";

import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";

import "./theme/variables.css";
import "./layout/base.css";
import "./layout/components.css";
import "./layout/header.css";
import "./layout/footer.css";

import NavMenu from "./layout/NavMenu";
import { ScrollProvider } from "./lib/scroll";
import Home from "./pages/Home";

// Same look on the web, iOS and Android.
setupIonicReact({ mode: "md" });

export default function App() {
  return (
    <IonApp>
      <ScrollProvider>
        <IonReactRouter>
          <NavMenu />
          {/* One page for both languages ("/" = English, "/es" = Spanish): a plain <Route>
              keeps a single page instance, so switching language only swaps the text and
              keeps your place. (IonRouterOutlet would stack a second copy of the page.) */}
          <Switch>
            <Route exact path="/:lang(es)?" component={Home} />
            <Redirect to="/" />
          </Switch>
        </IonReactRouter>
      </ScrollProvider>
    </IonApp>
  );
}
