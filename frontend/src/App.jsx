import { useEffect, useState } from "react";
import { ArrowUpRight, Building2, Home, Paintbrush, Hammer, Phone, Mail, MapPin, Menu, X, ShieldCheck, Plus, Trash2, LogOut, ClipboardList, Pencil, ZoomIn, ZoomOut, RotateCcw, Sparkles } from "lucide-react";
import { mediaUrl, request } from "./api";

const heroSlides = [
  {
    image: "/hero/slide-1.jpg",
    subtitle: "Modern Architectural Elevations",
    badge: "Residential Grandeur",
    description: "Striking contemporary multi-storey apartments built with precision engineering, glass balustrades & premium finishes."
  },
  {
    image: "/hero/slide-2.jpg",
    subtitle: "Innovative Living Spaces",
    badge: "Architectural Design",
    description: "Thoughtfully planned residential layouts with elegant facade styling, expansive balconies, and seamless natural ventilation."
  },
  {
    image: "/hero/slide-3.jpg",
    subtitle: "Mastercrafted Construction",
    badge: "Completed Landmark",
    description: "Proven delivery of premium residential developments with intricate gatecraft, composite wood panelling, and enduring quality."
  },
  {
    image: "/hero/slide-4.jpg",
    subtitle: "Engineered For Generations",
    badge: "Structural Integrity",
    description: "Robust foundations, stilt parking planning, and meticulous construction standards trusted across Chennai."
  }
];

const blankCompany = {
  name: "Sri Sai Laxmi Builders", short_name: "SSL", phone1: "95000 23111",
  phone2: "95433 06600", email: "srisailaxmi101@gmail.com",
  address: 'Old No.35, New No.46, "Anbhakam", First Floor, Kamarajar Street, B.V. Nagar, Chennai - 600 114.',
  additional_address: "Meenambakkam Moovarasampet Main Road, Opp. Kendriya Vidhyalaya.",
  tagline: "Building your dreams."
};
const icons = [Home, Building2, Paintbrush, Hammer];

function PublicSite() {
  const [site, setSite] = useState({ company: blankCompany, services: [], projects: [] });
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [orderForm, setOrderForm] = useState({ customer_name: "", phone: "", email: "", address: "", service_type: "", order_details: "", quantity: "", budget: "" });
  const [notice, setNotice] = useState("");
  const [orderNotice, setOrderNotice] = useState("");
  const [menu, setMenu] = useState(false);
  const [lightboxProject, setLightboxProject] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  useEffect(() => {
    if (isHeroPaused) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isHeroPaused]);

  useEffect(() => {
    request("/public/site").then(setSite).catch(e => setNotice(e.message));
  }, []);
  useEffect(() => {
    if (!lightboxProject) return;
    function closeOnEscape(e) {
      if (e.key === "Escape") setLightboxProject(null);
    }
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [lightboxProject]);

  async function submit(e) {
    e.preventDefault();
    try {
      await request("/public/enquiries", { method: "POST", body: JSON.stringify(form) });
      setNotice("Thank you! Your enquiry has been received.");
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch (e) { setNotice(e.message); }
  }
  async function submitOrder(e) {
    e.preventDefault();
    try {
      await request("/public/orders", { method: "POST", body: JSON.stringify(orderForm) });
      setOrderNotice("Your order request has been submitted. Our team will contact you soon.");
      setOrderForm({ customer_name: "", phone: "", email: "", address: "", service_type: "", order_details: "", quantity: "", budget: "" });
    } catch (e) { setOrderNotice(e.message); }
  }
  function openLightbox(project) {
    setLightboxProject(project);
    setZoom(1);
  }
  function closeLightbox() {
    setLightboxProject(null);
    setZoom(1);
  }

  const c = site.company || blankCompany;
  return <main>
    <header className="nav">
      <a className="logo" href="#home"><img src="/logo.png" alt="Sri Sai Laxmi Builders Logo" className="logo-img" /><span>{c.name}<small>BUILDERS</small></span></a>
      <button className="menu" onClick={() => setMenu(!menu)} aria-label="Toggle menu">{menu ? <X/> : <Menu/>}</button>
      <nav className={menu ? "open" : ""}>
        {["Home","About","Services","Projects","Orders","Contact"].map(x => <a key={x} href={`#${x.toLowerCase()}`} onClick={() => setMenu(false)}>{x}</a>)}
        <a className="nav-cta" href="#contact">Get in touch <ArrowUpRight size={16}/></a>
      </nav>
    </header>

    <section
      className="hero"
      id="home"
      onMouseEnter={() => setIsHeroPaused(true)}
      onMouseLeave={() => setIsHeroPaused(false)}
      aria-label="Sri Sai Laxmi Builders Hero Showcase"
    >
      {/* Background Slides with smooth transition and subtle moving zoom animation */}
      <div className="hero-slider-bg">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide ${index === heroIndex ? "active" : ""}`}
            aria-hidden={index !== heroIndex}
          >
            <div
              className="hero-slide-img"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
          </div>
        ))}
      </div>

      {/* Multi-layered cinematic dark overlays for depth and high contrast readability */}
      <div className="hero-overlay-dark"></div>
      <div className="hero-overlay-gradient"></div>
      <div className="hero-overlay-vignette"></div>

      {/* Central hero content */}
      <div className="hero-main-container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-pulse"></span>
            <Sparkles size={14} className="gold-icon" />
            <span>CHENNAI’S PREMIER BUILDERS & DEVELOPERS</span>
          </div>

          <h1 className="hero-title">
            <span className="hero-title-main">SRI SAI LAXMI</span>
            <span className="hero-title-sub">BUILDERS</span>
          </h1>

          <p className="hero-tagline">
            Thoughtful Spaces. <em>Strong Foundations.</em> Built to Last.
          </p>

          <p className="hero-description">
            From modern multi-storey residential elevations to custom structural builds, we deliver architectural elegance and turnkey excellence with unmatched dedication and enduring quality.
          </p>

          <div className="hero-cta-group">
            <a className="explore-btn" href="#projects">
              <span>Explore Projects</span>
              <div className="explore-btn-circle">
                <ArrowUpRight size={18} />
              </div>
            </a>
            <a className="discuss-btn" href="#orders">
              <span>Place Order / Get Quote</span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <section className="intro section" id="about">
      <div><span className="eyebrow">WELCOME TO SSL</span><h2>Built on care.<br/><em>Made to last.</em></h2></div>
      <p>Thank you for considering Sri Sai Laxmi Builders. Get in touch with us to discuss your requirements and learn how we can help with your project.</p>
    </section>

    <section className="section dark" id="services">
      <span className="eyebrow">WHAT WE OFFER</span><h2>Services</h2>
      {site.services.length ? <div className="cards">{site.services.map((s,i) => {
        const Icon = icons[i % icons.length];
        return <article className="service-card" key={s.id}><Icon/><h3>{s.title}</h3><p>{s.description}</p></article>;
      })}</div> : <p className="muted">Service information will be added by the company.</p>}
    </section>

    <section className="section" id="projects">
      <span className="eyebrow">OUR WORK</span><h2>Projects</h2>
      {site.projects.length ? <div className="cards">{site.projects.map(p => <article className="project-card" key={p.id}>
        {p.image_url && <button className="project-image-button" type="button" onClick={() => openLightbox(p)} aria-label={`Open ${p.title} image`}>
          <img src={mediaUrl(p.image_url)} alt={p.title}/><span className="image-hint">Click to enlarge</span>
        </button>}<span>{p.category}</span><h3>{p.title}</h3><p>{p.description}</p>
      </article>)}</div> : <p className="muted">Project details and photographs will appear here when added by the company.</p>}
    </section>

    {lightboxProject && <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${lightboxProject.title} project image`} onMouseDown={e => {
      if (e.target === e.currentTarget) closeLightbox();
    }}>
      <div className="lightbox-toolbar">
        <span>{lightboxProject.title}</span>
        <div>
          <button type="button" onClick={() => setZoom(Math.max(0.75, zoom - 0.25))} aria-label="Zoom out"><ZoomOut/></button>
          <button type="button" onClick={() => setZoom(1)} aria-label="Reset zoom"><RotateCcw/></button>
          <button type="button" onClick={() => setZoom(Math.min(3, zoom + 0.25))} aria-label="Zoom in"><ZoomIn/></button>
          <button type="button" onClick={closeLightbox} aria-label="Close image viewer"><X/></button>
        </div>
      </div>
      <div className="lightbox-image-wrap">
        <img src={mediaUrl(lightboxProject.image_url)} alt={lightboxProject.title} style={{ transform: `scale(${zoom})` }}/>
      </div>
    </div>}

    <section className="section order-section" id="orders">
      <div><span className="eyebrow">START YOUR PROJECT</span><h2>Place an<br/><em>order request.</em></h2>
        <p>Share your requirements and our team will review them and get back to you with the next steps.</p>
      </div>
      <form className="contact-form" onSubmit={submitOrder}>
        <h3>Customer order details</h3>
        <div className="form-grid">
          <input required placeholder="Full name" value={orderForm.customer_name} onChange={e=>setOrderForm({...orderForm,customer_name:e.target.value})}/>
          <input required placeholder="Phone number" value={orderForm.phone} onChange={e=>setOrderForm({...orderForm,phone:e.target.value})}/>
        </div>
        <input type="email" placeholder="Email (optional)" value={orderForm.email} onChange={e=>setOrderForm({...orderForm,email:e.target.value})}/>
        <input placeholder="Address / project location" value={orderForm.address} onChange={e=>setOrderForm({...orderForm,address:e.target.value})}/>
        <input required placeholder="Service required" value={orderForm.service_type} onChange={e=>setOrderForm({...orderForm,service_type:e.target.value})}/>
        <textarea required placeholder="Describe your order or construction requirements" value={orderForm.order_details} onChange={e=>setOrderForm({...orderForm,order_details:e.target.value})}/>
        <div className="form-grid">
          <input placeholder="Quantity / size (optional)" value={orderForm.quantity} onChange={e=>setOrderForm({...orderForm,quantity:e.target.value})}/>
          <input placeholder="Budget (optional)" value={orderForm.budget} onChange={e=>setOrderForm({...orderForm,budget:e.target.value})}/>
        </div>
        <button className="gold-btn"><ClipboardList size={17}/> Submit order request</button>
        {orderNotice && <p className="notice" role="status">{orderNotice}</p>}
      </form>
    </section>

    <section className="section dark contact" id="contact">
      <div><span className="eyebrow">CONTACT SRI SAI LAXMI BUILDERS</span><h2>Let's discuss<br/><em>your requirements.</em></h2>
        <div className="details">
          <p><Phone/> <a href={`tel:${c.phone1.replace(/\s/g,"")}`}>{c.phone1}</a> · <a href={`tel:${c.phone2.replace(/\s/g,"")}`}>{c.phone2}</a></p>
          <p><Mail/> <a href={`mailto:${c.email}`}>{c.email}</a></p>
          <p><MapPin/> {c.address}</p>
          <p><MapPin/> {c.additional_address}</p>
        </div>
      </div>
      <form className="contact-form" onSubmit={submit}>
        <h3>Send an enquiry</h3>
        <input required placeholder="Your name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <input required placeholder="Phone number" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
        <input type="email" placeholder="Email (optional)" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        <textarea required placeholder="Tell us about your requirements" value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/>
        <button className="gold-btn">Submit enquiry <ArrowUpRight size={17}/></button>
        {notice && <p className="notice" role="status">{notice}</p>}
      </form>
    </section>
    <footer>
      <a className="logo" href="#home"><img src="/logo.png" alt="Sri Sai Laxmi Builders Logo" className="logo-img" /><span>{c.name}<small>BUILDERS</small></span></a>
      <span>© {new Date().getFullYear()} {c.name}. All rights reserved.</span>
    </footer>
  </main>;
}

function Admin() {
  const [logged, setLogged] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [service, setService] = useState({title:"",description:""});
  const [project, setProject] = useState({title:"",category:"",description:"",image_url:"",image:null});

  async function load() {
    const [site, enq, orderList] = await Promise.all([
      request("/public/site"), request("/admin/enquiries"), request("/admin/orders")
    ]);
    setServices(site.services); setProjects(site.projects); setEnquiries(enq); setOrders(orderList); setLogged(true);
  }
  useEffect(() => { request("/admin/me").then(load).catch(()=>{}); }, []);

  async function login(e) {
    e.preventDefault(); setError("");
    try { await request("/admin/login", {method:"POST",body:JSON.stringify({username,password})}); await load(); }
    catch(e) { setError(e.message); }
  }
  async function addService(e) {
    e.preventDefault();
    try { await request("/admin/services",{method:"POST",body:JSON.stringify(service)}); setService({title:"",description:""}); await load(); }
    catch(e) { setError(e.message); }
  }
  async function addProject(e) {
    e.preventDefault();
    try {
      const body = new FormData();
      body.append("title", project.title);
      body.append("category", project.category);
      body.append("description", project.description);
      if (project.image) body.append("image", project.image);
      await request("/admin/projects",{method:"POST",body});
      setProject({title:"",category:"",description:"",image_url:"",image:null});
      await load();
    }
    catch(e) { setError(e.message); }
  }
  async function remove(path) { try { await request(path,{method:"DELETE"}); await load(); } catch(e) { setError(e.message); } }
  async function saveOrder(e) {
    e.preventDefault();
    try { await request(`/admin/orders/${editingOrder.id}`, { method: "PUT", body: JSON.stringify(editingOrder) }); setEditingOrder(null); await load(); }
    catch(e) { setError(e.message); }
  }
  async function logout() { await request("/admin/logout",{method:"POST"}); setLogged(false); }

  if (!logged) return <main className="admin-page"><form className="login-box" onSubmit={login}>
    <a className="logo" href="/"><img src="/logo.png" alt="Sri Sai Laxmi Builders Logo" className="logo-img" /><span>SRI SAI LAXMI<small>BUILDERS ADMIN</small></span></a>
    <ShieldCheck size={38}/><h1>Admin login</h1><p>Sign in to manage website content.</p>
    <input required placeholder="Username" autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)}/>
    <input required type="password" placeholder="Password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/>
    <button className="gold-btn">Login securely</button>{error && <p className="error">{error}</p>}
    <a href="/">← Back to website</a>
  </form></main>;

  return <main className="admin-page"><div className="dashboard">
    <header className="admin-head"><div><span className="eyebrow">SSL WEBSITE CONTROL</span><h1>Admin dashboard</h1></div><button className="outline-btn" onClick={logout}><LogOut size={16}/> Logout</button></header>
    {error && <p className="error">{error}</p>}
    <section className="admin-panel"><h2>Add service</h2><form onSubmit={addService} className="admin-form">
      <input required placeholder="Service title" value={service.title} onChange={e=>setService({...service,title:e.target.value})}/>
      <textarea required placeholder="Description" value={service.description} onChange={e=>setService({...service,description:e.target.value})}/>
      <button className="gold-btn"><Plus size={16}/> Add service</button>
    </form><ul>{services.map(s=><li key={s.id}><span><b>{s.title}</b><small>{s.description}</small></span><button className="delete" onClick={()=>remove(`/admin/services/${s.id}`)}><Trash2/></button></li>)}</ul></section>

    <section className="admin-panel"><h2>Add project</h2><form onSubmit={addProject} className="admin-form">
      <input required placeholder="Project title" value={project.title} onChange={e=>setProject({...project,title:e.target.value})}/>
      <input required placeholder="Category" value={project.category} onChange={e=>setProject({...project,category:e.target.value})}/>
      <textarea required placeholder="Project description" value={project.description} onChange={e=>setProject({...project,description:e.target.value})}/>
      <label className="file-field">Project photo (optional)
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setProject({...project,image:e.target.files?.[0] || null})}/>
        <small>{project.image ? `${project.image.name} selected` : "JPEG, PNG or WebP up to 5 MB"}</small>
      </label>
      <button className="gold-btn"><Plus size={16}/> Add project</button>
    </form><ul>{projects.map(p=><li key={p.id}><span className="project-admin-item">{p.image_url && <img src={mediaUrl(p.image_url)} alt="" /> }<span><b>{p.title}</b><small>{p.category} — {p.description}</small></span></span><button className="delete" onClick={()=>remove(`/admin/projects/${p.id}`)}><Trash2/></button></li>)}</ul></section>

    <section className="admin-panel"><h2>Customer enquiries ({enquiries.length})</h2>
      {enquiries.length ? <ul>{enquiries.map(e=><li key={e.id}><span><b>{e.name} · {e.phone}</b><small>{e.email} — {e.message} · {e.created_at}</small></span><button className="delete" onClick={()=>remove(`/admin/enquiries/${e.id}`)}><Trash2/></button></li>)}</ul> : <p className="muted">No enquiries received yet.</p>}
    </section>
    <section className="admin-panel"><h2>Customer orders ({orders.length})</h2>
      {orders.length ? <ul>{orders.map(order => editingOrder?.id === order.id ? <li key={order.id} className="order-edit">
        <form className="admin-form" onSubmit={saveOrder}>
          <input required placeholder="Customer name" value={editingOrder.customer_name} onChange={e=>setEditingOrder({...editingOrder,customer_name:e.target.value})}/>
          <input required placeholder="Phone" value={editingOrder.phone} onChange={e=>setEditingOrder({...editingOrder,phone:e.target.value})}/>
          <input type="email" placeholder="Email" value={editingOrder.email} onChange={e=>setEditingOrder({...editingOrder,email:e.target.value})}/>
          <input placeholder="Address / project location" value={editingOrder.address} onChange={e=>setEditingOrder({...editingOrder,address:e.target.value})}/>
          <input required placeholder="Service" value={editingOrder.service_type} onChange={e=>setEditingOrder({...editingOrder,service_type:e.target.value})}/>
          <textarea required placeholder="Order details" value={editingOrder.order_details} onChange={e=>setEditingOrder({...editingOrder,order_details:e.target.value})}/>
          <div className="form-grid">
            <input placeholder="Quantity / size" value={editingOrder.quantity} onChange={e=>setEditingOrder({...editingOrder,quantity:e.target.value})}/>
            <input placeholder="Budget" value={editingOrder.budget} onChange={e=>setEditingOrder({...editingOrder,budget:e.target.value})}/>
          </div>
          <select value={editingOrder.status} onChange={e=>setEditingOrder({...editingOrder,status:e.target.value})}>
            {["pending","accepted","rejected","in_progress","completed","cancelled"].map(status => <option key={status} value={status}>{status.replace("_"," ")}</option>)}
          </select>
          <textarea placeholder="Admin note" value={editingOrder.admin_note} onChange={e=>setEditingOrder({...editingOrder,admin_note:e.target.value})}/>
          <div className="order-actions"><button className="gold-btn">Save order</button><button type="button" className="outline-btn" onClick={()=>setEditingOrder(null)}>Cancel</button></div>
        </form>
      </li> : <li key={order.id} className="order-row">
        <span><b>#{order.id} · {order.customer_name}</b><small>{order.phone}{order.email && ` · ${order.email}`} · {order.service_type}</small><small>{order.order_details}</small><small>{order.address && `Location: ${order.address} · `}{order.quantity && `Quantity: ${order.quantity} · `}{order.budget && `Budget: ${order.budget}`}</small><small>{order.admin_note && `Note: ${order.admin_note} · `}Submitted {order.created_at}</small></span>
        <span className={`status status-${order.status}`}>{order.status.replace("_"," ")}</span>
        <div className="order-actions"><button className="outline-btn" onClick={()=>setEditingOrder({...order})}><Pencil size={15}/> Edit</button><button className="delete" onClick={()=>remove(`/admin/orders/${order.id}`)}><Trash2/></button></div>
      </li>)}</ul> : <p className="muted">No customer orders received yet.</p>}
    </section>
    <a href="/">← View public website</a>
  </div></main>;
}

export default function App() {
  return window.location.pathname.replace(/\/+$/, "") === "/admin" ? <Admin/> : <PublicSite/>;
}
