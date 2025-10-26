// test.js
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function test() {
  // Test Register
  let res = await fetch("https://musicwithmefullstack-1.onrender.com/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      name: "Ayush", 
      email: "ayush@test.com", 
      password: "mypassword" 
    })
  });
  console.log("Register:", await res.json());

  // Test Login
  res = await fetch("https://musicwithmefullstack-1.onrender.com/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      email: "ayush@test.com", 
      password: "mypassword" 
    })
  });
  console.log("Login:", await res.json());
}

test();
