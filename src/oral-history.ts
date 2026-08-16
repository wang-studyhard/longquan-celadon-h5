import "./styles.css";
import { ArrowLeft, createIcons } from "lucide";

createIcons({ icons: { ArrowLeft } });

document.querySelector<HTMLAnchorElement>(".oral-back")?.addEventListener("click", () => {
  sessionStorage.setItem("celadon-return-to", "oral-history-01");
});
