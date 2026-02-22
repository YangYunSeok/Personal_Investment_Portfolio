async function testFetch() {
  try {
    const res = await fetch("http://localhost:3002/api/pip/transactions/metadata");
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Body:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}
testFetch();
