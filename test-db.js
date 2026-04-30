const url = 'https://pacbybeqsmazefvdzggj.supabase.co/rest/v1/payments';
const key = 'sb_publishable_kQT3uCgJlkt09udppx3CAA_llDU_NmB';

async function test() {
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                user_email: 'test@test.com',
                user_name: 'test',
                amount: 49000,
                status: 'pending'
            })
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Data:", data);
    } catch (e) {
        console.error("Fetch error:", e);
    }
}
test();
