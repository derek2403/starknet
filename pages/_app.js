import "@/styles/globals.css";
import { StarknetConfig, InjectedConnector } from "get-starknet";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;