import Html from "../../lib/Html";
import { useText } from "../../lib/i18n";
import en from "./en.json";
import es from "./es.json";
import "./inventory.css";

export default function Inventory() {
  const t = useText(en, es);
  const tree = t.tree;
  return (
    <section id="graph" className="section">
      <div className="wrap">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2>{t.title}</h2>
        <Html as="p" className="sub" html={t.intro} />

        <div className="tree">
          <div className="tree-node">{tree.requirement}</div>
          <div className="tree-arrow">↓</div>
          <div className="tree-node strong">{tree.analysis}</div>
          <div className="tree-arrow">↓</div>

          <div className="tree-branches">
            <div className="branch ok">
              <h4><span className="dot ok" />{tree.existing}</h4>
              <ul className="chain">
                <li><span className="tag db">SQL</span> inventoryStock</li>
                <li><span className="tag db">SQL</span> inventoryMovements</li>
                <li><span className="tag db">SQL</span> sp_inventory_adjust</li>
              </ul>
            </div>
            <div className="branch miss">
              <h4><span className="dot miss" />{tree.required}</h4>
              <ul className="chain">
                <li><span className="tag fe">Frontend</span> {tree.inventoryPage}</li>
                <li><span className="tag fe">Frontend</span> inventoryApi.ts</li>
                <li><span className="tag api">API</span> GET /inventory</li>
                <li><span className="tag be">Backend</span> inventory.py</li>
                <li><span className="tag be">Backend</span> routes_/inventory.py</li>
                <li><span className="tag ai">{tree.ai}</span> pos_inventory_support</li>
              </ul>
            </div>
          </div>

          <div className="tree-arrow">↓</div>
          <div className="plan-card">
            <h4>{t.plan.title}</h4>
            <div className="chips">{t.plan.items.map((i) => <span key={i}>{i}</span>)}</div>
            <p className="muted small">{t.plan.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
