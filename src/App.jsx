
import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "/api/items";

function App() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const emptyForm = {
    itemName: "",
    status: "LOST",
    category: "",
    color: "",
    location: "",
    itemDate: "",
    description: "",
  };

  const [form, setForm] = useState(emptyForm);

  async function loadItems() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setItems(data);
    } catch {
      setMessage("Cannot connect to backend. Check Spring Boot.");
    }
  }

  useEffect(() => {
    let ignore = false;
    async function fetchInitialItems() {
      try {
        const response = await fetch(API);
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();
        if (!ignore) {
          setItems(data);
        }
      } catch {
        if (!ignore) {
          setMessage("Cannot connect to backend. Check Spring Boot.");
        }
      }
    }
    fetchInitialItems();
    return () => {
      ignore = true;
    };
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Failed");

      setMessage("Item reported successfully!");
      setForm(emptyForm);
      await loadItems();
    } catch {
      setMessage(
        "Unable to submit. Check Spring Boot and CORS settings."
      );
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to remove this item?")) return;
    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed");
      setMessage("Item removed successfully.");
      await loadItems();
    } catch {
      setMessage("Failed to delete item.");
    }
  }

  const filteredItems = items.filter((item) =>
    [
      item.itemName,
      item.category,
      item.color,
      item.location,
      item.status,
    ].some((value) =>
      (value || "").toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="app">
      <header className="navbar">
        <h2>🔎 Smart Lost & Found</h2>

        <nav>
          <a href="#home">Home</a>
          <a href="#report">Report Item</a>
          <a href="#browse">Browse Items</a>
        </nav>
      </header>

      <section className="hero" id="home">
        <p className="eyebrow">FIND IT • REPORT IT • RETURN IT</p>
        <h1>
          Lost something?
          <br />
          Let's find it together.
        </h1>
        <p>
          A smarter way to reconnect people with their belongings.
        </p>
        <a href="#report" className="primary-btn">
          Report an Item →
        </a>
      </section>

      <section className="section" id="report">
        <h2>Report an Item</h2>
        <p className="subtitle">
          Help someone recover their belongings or find what you lost.
        </p>

        <form className="report-form" onSubmit={handleSubmit}>
          <label>
            Item Name *
            <input
              name="itemName"
              value={form.itemName}
              onChange={handleChange}
              placeholder="Example: Black wallet"
              required
            />
          </label>

          <label>
            Report Type *
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              required
            >
              <option value="LOST">I lost an item</option>
              <option value="FOUND">I found an item</option>
            </select>
          </label>

          <label>
            Category *
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Electronics, Bags..."
              required
            />
          </label>

          <label>
            Color
            <input
              name="color"
              value={form.color}
              onChange={handleChange}
              placeholder="Example: Black"
            />
          </label>

          <label>
            Location *
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Where was it lost or found?"
              required
            />
          </label>

          <label>
            Date *
            <input
              type="date"
              name="itemDate"
              value={form.itemDate}
              onChange={handleChange}
              required
            />
          </label>

          <label className="full-width">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Add identifying details..."
            />
          </label>

          <button className="primary-btn full-width" type="submit">
            Submit Report
          </button>
        </form>

        {message && <p className="message">{message}</p>}
      </section>

      <section className="section" id="browse">
        <h2>Explore Reported Items</h2>
        <p className="subtitle">
          Search reports by item name, category, color, or location.
        </p>

        <input
          className="search-box"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="🔍 Search items..."
        />

        <div className="item-grid">
          {filteredItems.map((item) => (
            <article className="item-card" key={item.id}>
              <span className={item.status === "LOST" ? "lost" : "found"}>
                {item.status}
              </span>

              <h3>{item.itemName}</h3>
              <p>📁 Category: {item.category}</p>
              <p>🎨 Color: {item.color || "Not specified"}</p>
              <p>📍 Location: {item.location}</p>
              <p>📅 Date: {item.itemDate}</p>
              <p>{item.description}</p>
              <button
                type="button"
                className="delete-btn"
                onClick={() => handleDelete(item.id)}
              >
                🗑️ Delete
              </button>
            </article>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <p className="empty">No matching items found.</p>
        )}
      </section>

      <footer>
        <h3>🔎 Smart Lost & Found</h3>
        <p>Small discoveries. Happy reunions.</p>
      </footer>
    </div>
  );
}

export default App;
