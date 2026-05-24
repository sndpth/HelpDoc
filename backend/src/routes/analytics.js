const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/analytics - Get hospital analytics dashboard metrics
router.get('/', authenticateToken, async (req, res) => {
  const hospitalId = req.user.hospitalId;
  const todayStr = new Date().toLocaleDateString(); // Matches client-side format (e.g., MM/DD/YYYY or YYYY-MM-DD depending on locale)
  
  // Format today's date in YYYY-MM-DD as well just in case
  const isoToday = new Date().toISOString().split('T')[0];

  try {
    // 1. Fetch Hospital Bed Capacity
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: { bedCapacity: true, name: true }
    });
    const capacity = hospital ? hospital.bedCapacity : 50;

    // 2. Inpatient Census (Currently Admitted Inpatients)
    const inpatientCount = await prisma.patient.count({
      where: {
        hospitalId,
        status: 'Admitted',
        type: 'IPD'
      }
    });

    // 3. Outpatient (OPD) Appointments Today
    const opdTodayCount = await prisma.appointment.count({
      where: {
        patient: { hospitalId },
        date: {
          in: [todayStr, isoToday]
        }
      }
    });

    // 4. Ward Occupancy Distribution
    const wardOccupanciesRaw = await prisma.patient.groupBy({
      by: ['wardName'],
      where: {
        hospitalId,
        status: 'Admitted',
        type: 'IPD'
      },
      _count: {
        recordID: true
      }
    });

    const wardOccupancies = wardOccupanciesRaw.map(w => ({
      wardName: w.wardName || 'Unassigned Ward',
      count: w._count.recordID
    }));

    // 5. Patient Status Distribution
    const statusDistributionRaw = await prisma.patient.groupBy({
      by: ['status'],
      where: { hospitalId },
      _count: {
        recordID: true
      }
    });

    const statusDistribution = statusDistributionRaw.map(s => ({
      status: s.status,
      count: s._count.recordID
    }));

    // 6. Doctor Workload Distribution (Active Inpatients per Incharge Doctor)
    const doctorWorkloadsRaw = await prisma.patient.groupBy({
      by: ['inchargeDoctor'],
      where: {
        hospitalId,
        status: 'Admitted',
        type: 'IPD'
      },
      _count: {
        recordID: true
      }
    });

    const doctorWorkloads = doctorWorkloadsRaw.map(d => ({
      doctorName: d.inchargeDoctor || 'Unassigned Doctor',
      count: d._count.recordID
    }));

    // 7. Average Length of Stay (LOS) for Discharged Patients
    const dischargedPatients = await prisma.patient.findMany({
      where: {
        hospitalId,
        status: 'Discharged'
      },
      select: {
        dateOfAdmission: true,
        dateOfDischarge: true
      }
    });

    let totalDays = 0;
    let validDischargedCount = 0;

    dischargedPatients.forEach(p => {
      if (p.dateOfAdmission && p.dateOfDischarge) {
        const d1 = new Date(p.dateOfAdmission);
        const d2 = new Date(p.dateOfDischarge);
        if (!isNaN(d1) && !isNaN(d2)) {
          const diffTime = Math.abs(d2 - d1);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          totalDays += diffDays;
          validDischargedCount++;
        }
      }
    });

    const averageLOS = validDischargedCount > 0 ? (totalDays / validDischargedCount).toFixed(1) : "0.0";

    res.json({
      hospitalName: hospital ? hospital.name : 'HelpDoc Hospital',
      bedCapacity: capacity,
      inpatientCensus: inpatientCount,
      opdAppointmentsToday: opdTodayCount,
      bedOccupancyRate: capacity > 0 ? ((inpatientCount / capacity) * 100).toFixed(1) : "0.0",
      averageLOS,
      wardOccupancies,
      statusDistribution,
      doctorWorkloads
    });
  } catch (error) {
    console.error('Fetch analytics error:', error);
    res.status(500).json({ error: 'Server error generating analytics.' });
  }
});

module.exports = router;
