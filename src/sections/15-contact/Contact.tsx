import LeadForm from "../../components/lead-form/LeadForm";
import { useText } from "../../lib/i18n";
import { LOGIN_URL } from "../../lib/site";
import en from "./en.json";
import es from "./es.json";
import "./contact.css";

/** Contact module: a message to the GMO team, saved as a lead (source "contact_form") for follow-up. */
export default function Contact() {
  const t = useText(en, es);
  return (
    <section id="contact" className="section alt contact">
      <div className="wrap contact-grid">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h2>{t.title}</h2>
          <p className="sub">{t.intro}</p>
          <ul className="checks">{t.points.map((p) => <li key={p}>{p}</li>)}</ul>
          <p className="contact-login">{t.alreadyCustomer} <a href={LOGIN_URL}>{t.login} →</a></p>
        </div>
        <LeadForm source="contact_form" />
      </div>
    </section>
  );
}
