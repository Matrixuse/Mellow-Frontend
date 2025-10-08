// Live backend base URL
const API_URL = 'https://musious-1.onrender.com/api/songs';

export const getSongs = async (token) => {
    // Browser ki memory se user ka data nikaalna
    // Ab token ko sidhe argument se le rahe hain
    // const user = JSON.parse(localStorage.getItem('user'));
    // let token = null;

    // User ke data se token nikaalna
    // if (user && user.token) {
    //     token = user.token;
    // }

    // Agar token nahi hai, toh ek khaali list bhej do taaki app crash na ho
    if (!token) {
        console.warn('Authentication token not found, cannot fetch songs.');
        return []; 
    }

    // Backend server ko request bhejna
    const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
            // Hum request ke saath security token bhej rahe hain
            'Authorization': `Bearer ${token}`
        }
    });

    // Agar server se koi error aaye, toh use handle karna
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch songs');
    }

    // Agar sab theek hai, toh gaano ki list bhej do
    return response.json();
};

