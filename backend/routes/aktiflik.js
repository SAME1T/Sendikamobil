const express = require('express');
const router = express.Router();
const { aktiflikPuaniHesapla, sendikaUcretiHesapla } = require('../utils/aktiflik');

// Aktiflik puanı ve sendika ücreti getir
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`Aktiflik bilgileri isteniyor - User ID: ${userId}`);
    
    // Aktiflik puanını hesapla ve güncelle
    const aktiflikPuani = await aktiflikPuaniHesapla(userId);
    
    // Sendika ücretini hesapla
    const sendikaUcreti = await sendikaUcretiHesapla(userId);
    
    console.log('Hesaplanan değerler:', {
      aktiflikPuani,
      sendikaUcreti
    });
    
    res.json({
      success: true,
      aktiflikPuani: aktiflikPuani,
      sendikaUcreti: sendikaUcreti.ucret,
      saatlikMaas: sendikaUcreti.saatlikMaas
    });
    
  } catch (error) {
    console.error('Aktiflik bilgileri getirme hatası:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router; 