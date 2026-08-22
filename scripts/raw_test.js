const url = "https://sisgtelzutshbnydazip.supabase.co/rest/v1/companies?select=*";
const anonKey = "sb_publishable_G--r7WpLJIVLrwRjwoFfEw_vmH9TYuY";

fetch(url, {
  method: 'GET',
  headers: {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`
  }
})
.then(res => res.json())
.then(data => {
  console.log("Response from Supabase:", data);
})
.catch(err => {
  console.error("Fetch error:", err);
});
