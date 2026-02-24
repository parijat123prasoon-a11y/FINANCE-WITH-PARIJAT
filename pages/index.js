import React, { useEffect, useState } from "react";
import Card from "../components/ui/card";
import Button from "../components/ui/button";
import Input from "../components/ui/input";

// Simple XML Parser
function parseRSS(xmlText, source) {
  try {
    const items = xmlText.split("<item>").slice(1, 6);
    return items.map((item) => {
      const getTag = (tag) => {
        const match = item.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
        return match ? match[1].replace(/<!\\[CDATA\\[(.*?)\\]\]>/, "$1").trim() : "";
      };
      return {
        title: getTag("title"),
        company: "Market",
        source,
        time: getTag("pubDate"),
      };
    });
  } catch (e) {
    console.error("RSS Parse Error", e);
    return [];
  }
}

export default function FinanceWithParijat() {
  const [darkMode, setDarkMode] = useState(true);
  const [page, setPage] = useState("home");
  const [news, setNews] = useState([]);
  const [market, setMarket] = useState({
    nifty: "Loading...",
    sensex: "Loading...",
    status: "Fetching...",
  });

  // Fetch Market Data
  useEffect(() => {
    async function fetchMarket() {
      try {
        const res = await fetch(
          "https://api.allorigins.win/raw?url=https://www.nseindia.com/api/allIndices"
        );
        const data = await res.json();
        const nifty = data?.data?.find((i) => i.index === "NIFTY 50");
        const sensex = data?.data?.find((i) => i.index === "SENSEX");

        if (!nifty || !sensex) throw new Error("Indices not found");

        setMarket({
          nifty: `${nifty.last} ${nifty.percentChange >= 0 ? "▲" : "▼"} ${nifty.percentChange}%`,
          sensex: `${sensex.last} ${sensex.percentChange >= 0 ? "▲" : "▼"} ${sensex.percentChange}%`,
          status: nifty.marketStatus || "OPEN",
        });
      } catch (err) {
        console.error("Market API error", err);
        setMarket((prev) => ({ ...prev, status: "Unavailable" }));
      }
    }

    fetchMarket();
    const interval = setInterval(fetchMarket, 300000);
    return () => clearInterval(interval);
  }, []);

  // Fetch News
  useEffect(() => {
    async function fetchNews() {
      try {
        const feeds = [
          {
            url: "https://api.allorigins.win/raw?url=https://www.moneycontrol.com/rss/business.xml",
            source: "Moneycontrol",
          },
          {
            url: "https://api.allorigins.win/raw?url=https://feeds.feedburner.com/ndtvprofit-latest",
            source: "NDTV Profit",
          },
        ];

        let allNews = [];
        for (const feed of feeds) {
          const res = await fetch(feed.url);
          const text = await res.text();
          const parsed = parseRSS(text, feed.source);
          allNews = [...allNews, ...parsed];
        }
        setNews(allNews);
      } catch (err) {
        console.error("News API error", err);
        setNews([
          {
            title: "Unable to load news right now.",
            company: "System",
            source: "Finance with Parijat",
            time: "Please refresh later",
          },
        ]);
      }
    }

    fetchNews();
    const interval = setInterval(fetchNews, 1800000);
    return () => clearInterval(interval);
  }, []);

  // Render Pages
  const renderPage = () => {
    if (page === "news") return <NewsPage news={news} />;
    if (page === "about") return <AboutPage />;
    return <HomePage market={market} news={news} />;
  };

  return (
    <div style={{ backgroundColor: darkMode ? "#1a1a1a" : "#f5f5f5", color: darkMode ? "white" : "black", minHeight: "100vh" }}>
      {/* NAVBAR */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderBottom: "1px solid #333" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", cursor: "pointer" }} onClick={() => setPage("home")}>
          Finance with Parijat
        </h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button label="Home" onClick={() => setPage("home")} />
          <Button label="News" onClick={() => setPage("news")} />
          <Button label="About" onClick={() => setPage("about")} />
          <Button label={darkMode ? "Light Mode" : "Dark Mode"} onClick={() => setDarkMode(!darkMode)} />
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div style={{ padding: "20px" }}>
        {renderPage()}
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #333", padding: "20px", textAlign: "center", opacity: 0.7 }}>
        © {new Date().getFullYear()} Finance with Parijat — Built for Indian Investors
      </footer>
    </div>
  );
}

// Home Page
function HomePage({ market, news }) {
  return (
    <>
      <section style={{ padding: "40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
        <div>
          <h2 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "20px" }}>
            Indian Stock Market Insights, Simplified
          </h2>
          <p style={{ fontSize: "18px", opacity: 0.8, marginBottom: "20px" }}>
            Live NIFTY 50 & SENSEX updates with daily NDTV Profit & Moneycontrol news.
          </p>
          <Button label="Explore Markets" onClick={() => {}} />
        </div>
        <Card title="Market Snapshot" content={`NIFTY 50: ${market.nifty}\nSENSEX: ${market.sensex}\nStatus: ${market.status}`} />
      </section>

      <section style={{ padding: "20px 40px" }}>
        <Input placeholder="Search stocks (e.g., RELIANCE, TCS)..." />
      </section>

      <NewsGrid news={news} />
    </>
  );
}

// News Page
function NewsPage({ news }) {
  return (
    <section style={{ padding: "40px" }}>
      <h2 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "30px" }}>
        Market News (NDTV Profit & Moneycontrol)
      </h2>
      <NewsGrid news={news} />
    </section>
  );
}

// About Page
function AboutPage() {
  return (
    <section style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px" }}>About Parijat</h2>
      <p style={{ opacity: 0.8, lineHeight: "1.6" }}>
        Finance with Parijat is an Indian stock market education and news platform
        created to simplify investing for students and beginners. The goal is to
        provide daily market updates, simplified finance concepts, and practical
        investment knowledge.
      </p>
    </section>
  );
}

// News Grid
function NewsGrid({ news }) {
  return (
    <section style={{ padding: "20px 40px" }}>
      <h3 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "30px" }}>Latest Market News</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        {news.map((item, index) => (
          <Card key={index} title={item.title} content={`${item.source} • ${item.time}`} />
        ))}
      </div>
    </section>
  );
}