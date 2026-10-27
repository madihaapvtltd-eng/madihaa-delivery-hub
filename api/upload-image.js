// Vercel Serverless Function for Secure ImgBB Upload
// This function should be deployed to Vercel to handle image uploads securely
// The ImgBB API key is stored as an environment variable on Vercel

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const apiKey = process.env.IMGBB_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'ImgBB API key not configured' });
    }

    // Upload to ImgBB
    const formData = new FormData();
    formData.append('image', image);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // FormData handles Content-Type automatically with boundary
      },
      // Add API key as query parameter
      // Note: In production, consider using a backend proxy for additional security
    });

    const data = await response.json();

    if (data.success) {
      return res.status(200).json({
        url: data.data.url,
        deleteUrl: data.data.delete_url,
      });
    } else {
      return res.status(500).json({ error: 'Failed to upload image to ImgBB' });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
