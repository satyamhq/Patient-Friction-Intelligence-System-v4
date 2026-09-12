import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User.js';
import { Patient } from '../models/Patient.js';
import { Hospital } from '../models/Hospital.js';
import { DoctorProfile } from '../models/DoctorProfile.js';
import { AshaWorkerProfile } from '../models/AshaWorkerProfile.js';
import { GovernmentProfile } from '../models/GovernmentProfile.js';
import { generateToken } from '../utils/jwt.js';
import { AuditService } from '../services/auditService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { FrictionEngine } from '../intelligence/friction/frictionEngine.js';
import { RiskEngine } from '../intelligence/risk/riskEngine.js';
import { FrictionProfile } from '../models/FrictionProfile.js';
import { CareRisk } from '../models/CareRisk.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env.js';

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role, phone, ...extraDetails } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
        return;
      }

      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const normalizedEmail = email.toLowerCase().trim();
      const ADMIN_EMAILS = ['dhirajkumar464748@gmail.com', 'admin@pfis.org'];
      const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);

      let userRole: 'admin' | 'hospital' | 'patient' | 'doctor' | 'asha_worker' | 'government' = 'patient';
      if (isAdmin) {
        userRole = 'admin';
      } else if (role === 'hospital') {
        userRole = 'hospital';
      } else if (role === 'doctor') {
        userRole = 'doctor';
      } else if (role === 'asha_worker') {
        userRole = 'asha_worker';
      } else if (role === 'government') {
        userRole = 'government';
      } else {
        userRole = 'patient';
      }

      const newUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: userRole,
        phone,
      });

      let profileData: any = null;

      if (userRole === 'patient') {
        const count = await Patient.countDocuments();
        const patientCode = `PAT-${1000 + count + 1}`;

        const newPatient = await Patient.create({
          userId: newUser._id,
          patientCode,
          age: extraDetails.age || 42,
          gender: extraDetails.gender || 'female',
          preferredLanguage: extraDetails.preferredLanguage || 'Hindi',
          phone: phone || extraDetails.phone,
          transportAvailability: extraDetails.transportAvailability || 'low',
          digitalAccessLevel: extraDetails.digitalAccessLevel || 'basic',
          familySupport: extraDetails.familySupport || 'low',
          documentationStatus: extraDetails.documentationStatus || 'partial',
          financialAccessibility: extraDetails.financialAccessibility || 'severely_constrained',
          appointmentFlexibility: extraDetails.appointmentFlexibility || 'inflexible_daily_wage',
          residenceType: extraDetails.residenceType || 'rural_remote',
          location: {
            address: extraDetails.address || 'UniCenter, LPU Campus',
            city: extraDetails.city || 'Phagwara',
            state: extraDetails.state || 'Punjab',
            pincode: extraDetails.pincode || '144411',
            latitude: extraDetails.latitude || 31.2533,
            longitude: extraDetails.longitude || 75.7042,
            geoJSON: {
              type: 'Point',
              coordinates: [extraDetails.longitude || 75.7042, extraDetails.latitude || 31.2533],
            },
          },
        });

        // Initialize Friction & Risk with real closest hospital distance
        const allH = await Hospital.find({});
        let initialDist = 2.7;
        let initialHosp: any = null;
        if (allH && allH.length > 0) {
          let minD = 999999;
          const pLat = newPatient.location?.latitude || 31.2533;
          const pLng = newPatient.location?.longitude || 75.7042;
          for (const h of allH) {
            const d = FrictionEngine.calculateHaversineDistance(pLat, pLng, h.latitude, h.longitude);
            if (d < minD) {
              minD = d;
              initialHosp = h;
            }
          }
          if (minD < 999999) initialDist = Math.round(minD * 10) / 10;
        }

        const frictionCalc = FrictionEngine.calculate(newPatient.toObject(), initialHosp, initialDist);
        const frictionProfile = await FrictionProfile.create({
          patientId: newPatient._id,
          ...frictionCalc,
        });

        const riskCalc = RiskEngine.evaluate(frictionCalc);
        const careRisk = await CareRisk.create({
          patientId: newPatient._id,
          frictionProfileId: frictionProfile._id,
          ...riskCalc,
        });

        newPatient.activeFrictionProfileId = frictionProfile._id as any;
        newPatient.activeCareRiskId = careRisk._id as any;
        await newPatient.save();

        profileData = newPatient;
      } else if (userRole === 'hospital') {
        const newHospital = await Hospital.create({
          userId: newUser._id,
          name: extraDetails.hospitalName || name,
          type: extraDetails.type || 'Government',
          address: extraDetails.address || 'Civil Lines Medical Enclave',
          city: extraDetails.city || 'Ranchi',
          state: extraDetails.state || 'Jharkhand',
          pincode: extraDetails.pincode || '834001',
          latitude: extraDetails.latitude || 23.3629,
          longitude: extraDetails.longitude || 85.3262,
          geoJSON: {
            type: 'Point',
            coordinates: [extraDetails.longitude || 85.3262, extraDetails.latitude || 23.3629],
          },
          phone: phone || '0651-2441234',
          email: email.toLowerCase().trim(),
          emergencyAvailable: true,
          totalBeds: extraDetails.totalBeds || 300,
          availableBeds: extraDetails.availableBeds || 45,
          specialistAvailable: true,
        });
        profileData = newHospital;
      } else if (userRole === 'doctor') {
        const count = await DoctorProfile.countDocuments();
        const doctorCode = `DOC-${1000 + count + 1}`;
        const newDoctor = await DoctorProfile.create({
          userId: newUser._id,
          doctorCode,
          name: name.trim(),
          specialization: extraDetails.specialization || 'General Medicine',
          qualification: extraDetails.qualification || 'MBBS',
          licenseNumber: extraDetails.licenseNumber || '',
          hospitalId: extraDetails.hospitalId || null,
          hospitalName: extraDetails.hospitalName || '',
          experience: extraDetails.experience || 0,
          languages: extraDetails.languages || ['Hindi', 'English'],
          phone: phone || '',
          email: normalizedEmail,
          consultationFee: extraDetails.consultationFee || 0,
          opdTimings: extraDetails.opdTimings || '09:00 AM - 05:00 PM',
          availableDays: extraDetails.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          totalPatientsSeen: 0,
          location: {
            address: extraDetails.address || '',
            city: extraDetails.city || '',
            state: extraDetails.state || '',
            pincode: extraDetails.pincode || '',
            latitude: extraDetails.latitude || 0,
            longitude: extraDetails.longitude || 0,
          },
          isVerified: false,
          isActive: true,
        });
        profileData = newDoctor;
      } else if (userRole === 'asha_worker') {
        const count = await AshaWorkerProfile.countDocuments();
        const ashaCode = `ASHA-${2000 + count + 1}`;
        const newAsha = await AshaWorkerProfile.create({
          userId: newUser._id,
          ashaCode,
          name: name.trim(),
          phone: phone || '',
          email: normalizedEmail,
          zone: extraDetails.zone || 'Zone A',
          district: extraDetails.district || extraDetails.city || 'Local District',
          state: extraDetails.state || 'Punjab',
          assignedVillages: extraDetails.assignedVillages || [],
          supervisorName: extraDetails.supervisorName || '',
          supervisorPhone: extraDetails.supervisorPhone || '',
          totalPatientsTracked: 0,
          highRiskPatientCount: 0,
          referralsMade: 0,
          fieldVisitsThisMonth: 0,
          certificationLevel: extraDetails.certificationLevel || 'Basic',
          isActive: true,
        });
        profileData = newAsha;
      } else if (userRole === 'government') {
        const count = await GovernmentProfile.countDocuments();
        const govCode = `GOV-${3000 + count + 1}`;
        const newGov = await GovernmentProfile.create({
          userId: newUser._id,
          govCode,
          department: extraDetails.department || 'National Health Mission',
          designation: extraDetails.designation || 'Health Officer',
          state: extraDetails.state || '',
          district: extraDetails.district || '',
          accessLevel: extraDetails.accessLevel || 'district',
          phone: phone || '',
          email: normalizedEmail,
          isVerified: false,
          isActive: true,
        });
        profileData = newGov;
      }

      const token = generateToken({
        userId: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
      });

      await AuditService.log('AUTH_REGISTER', 'User', req, {
        userId: newUser._id,
        actorRole: newUser.role,
        details: { email: newUser.email, role: newUser.role },
      });

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
        },
        profile: profileData,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Registration failed.' });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required.' });
        return;
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email address or password.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash || user.password_hash || '');
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid email address or password.' });
        return;
      }

      const normalizedEmail = user.email.toLowerCase().trim();
      const ADMIN_EMAILS = ['dhirajkumar464748@gmail.com', 'admin@pfis.org'];
      if (ADMIN_EMAILS.includes(normalizedEmail) && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }

      let profile: any = null;
      if (user.role === 'patient') {
        profile = await Patient.findOne({ userId: user._id })
          .populate('activeFrictionProfileId')
          .populate('activeCareRiskId');
      } else if (user.role === 'hospital') {
        profile = await Hospital.findOne({ userId: user._id });
      }

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      await AuditService.log('AUTH_LOGIN', 'User', req, {
        userId: user._id,
        actorRole: user.role,
        details: { email: user.email },
      });

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
        profile,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Login failed.' });
    }
  }

  public static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      let profile: any = null;
      if (user.role === 'patient') {
        profile = await Patient.findOne({ userId: user._id })
          .populate('activeFrictionProfileId')
          .populate('activeCareRiskId');
      } else if (user.role === 'hospital') {
        profile = await Hospital.findOne({ userId: user._id });
      }

      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
        profile,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch session.' });
    }
  }

  public static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (req.user) {
      await AuditService.log('AUTH_LOGOUT', 'User', req, {
        userId: req.user._id,
        actorRole: req.user.role,
      });
    }
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  }

  public static async provisionGoogleUser(
    email: string,
    name: string,
    avatarUrl: string,
    role: any,
    req: Request
  ): Promise<{ token: string; user: any; profile: any }> {
    const normalizedEmail = (email || '').toLowerCase().trim();
    const ADMIN_EMAILS = ['dhirajkumar464748@gmail.com', 'admin@pfis.org'];
    const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);

    // ONLY whitelisted admin emails get Admin access. All others get hospital or patient.
    let assignedRole: 'admin' | 'hospital' | 'patient' = 'patient';
    if (isAdmin) {
      assignedRole = 'admin';
    } else if (role === 'hospital') {
      assignedRole = 'hospital';
    } else {
      assignedRole = 'patient';
    }

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const dummyPasswordHash = await bcrypt.hash(`google_${Date.now()}_${Math.random()}`, salt);

      user = await User.create({
        name: name || (isAdmin ? 'Dhiraj Kumar (Executive Admin)' : 'Google User'),
        email: normalizedEmail,
        passwordHash: dummyPasswordHash,
        role: assignedRole,
        avatarUrl,
        isActive: true,
      });

      if (user.role === 'patient') {
        const count = await Patient.countDocuments();
        const patientCode = `PAT-${1000 + count + 1}`;

        const newPatient = await Patient.create({
          userId: user._id,
          patientCode,
          age: 38,
          gender: 'other',
          preferredLanguage: 'Hindi',
          transportAvailability: 'moderate',
          digitalAccessLevel: 'moderate',
          familySupport: 'moderate',
          documentationStatus: 'complete',
          financialAccessibility: 'moderate_budget',
          appointmentFlexibility: 'flexible',
          residenceType: 'semi_urban',
          location: {
            address: 'UniCenter, LPU Campus',
            city: 'Phagwara',
            state: 'Punjab',
            pincode: '144411',
            latitude: 31.2533,
            longitude: 75.7042,
            geoJSON: {
              type: 'Point',
              coordinates: [75.7042, 31.2533],
            },
          },
        });

        // Calculate initial friction based on real closest hospital
        const allH = await Hospital.find({});
        let initialDist = 2.7;
        let initialHosp: any = null;
        if (allH && allH.length > 0) {
          let minD = 999999;
          for (const h of allH) {
            const d = FrictionEngine.calculateHaversineDistance(31.2533, 75.7042, h.latitude, h.longitude);
            if (d < minD) {
              minD = d;
              initialHosp = h;
            }
          }
          if (minD < 999999) initialDist = Math.round(minD * 10) / 10;
        }

        const frictionCalc = FrictionEngine.calculate(newPatient.toObject(), initialHosp, initialDist);
        const frictionProfile = await FrictionProfile.create({
          patientId: newPatient._id,
          ...frictionCalc,
        });

        const riskCalc = RiskEngine.evaluate(frictionCalc);
        const careRisk = await CareRisk.create({
          patientId: newPatient._id,
          frictionProfileId: frictionProfile._id,
          ...riskCalc,
        });

        newPatient.activeFrictionProfileId = frictionProfile._id as any;
        newPatient.activeCareRiskId = careRisk._id as any;
        await newPatient.save();
      } else if (user.role === 'hospital') {
        await Hospital.create({
          userId: user._id,
          name: `${name} Medical Facility`,
          type: 'Private/Charitable',
          address: 'GT Road Healthcare Plaza',
          city: 'Phagwara',
          state: 'Punjab',
          pincode: '144401',
          latitude: 31.2229,
          longitude: 75.7725,
          geoJSON: {
            type: 'Point',
            coordinates: [75.7725, 31.2229],
          },
          phone: '01824-260234',
          email: normalizedEmail,
          emergencyAvailable: true,
          totalBeds: 150,
          availableBeds: 25,
          specialistAvailable: true,
        });
      }
    } else {
      if (user.role !== assignedRole) {
        user.role = assignedRole;
        await user.save();
      }
      if (avatarUrl && !user.avatarUrl) {
        user.avatarUrl = avatarUrl;
        await user.save();
      }
    }

    let profile: any = null;
    if (user.role === 'patient') {
      profile = await Patient.findOne({ userId: user._id })
        .populate('activeFrictionProfileId')
        .populate('activeCareRiskId');
    } else if (user.role === 'hospital') {
      profile = await Hospital.findOne({ userId: user._id });
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    await AuditService.log('AUTH_GOOGLE_LOGIN', 'User', req, {
      userId: user._id,
      actorRole: user.role,
      details: { email: user.email, provider: 'google' },
    });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      },
      profile,
    };
  }

  public static async provisionAndLoginGoogleUser(
    email: string,
    name: string,
    avatarUrl: string,
    role: any,
    req: Request,
    res: Response
  ): Promise<void> {
    const { token, user, profile } = await AuthController.provisionGoogleUser(email, name, avatarUrl, role, req);

    res.status(200).json({
      success: true,
      message: 'Google authentication successful.',
      token,
      user,
      profile,
    });
  }

  public static async googleLogin(req: Request, res: Response): Promise<void> {
    try {
      const { credential, role, profileData } = req.body;

      if (!credential) {
        res.status(400).json({ success: false, message: 'Google credential token is required.' });
        return;
      }

      let email = '';
      let name = '';
      let avatarUrl = '';

      if (typeof credential === 'string' && credential.includes('.')) {
        try {
          const googleRes = await axios.get(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
            { timeout: 5000 }
          );
          const payload = googleRes.data;
          email = (payload.email || '').toLowerCase().trim();
          name = payload.name || payload.given_name || email.split('@')[0];
          avatarUrl = payload.picture || '';
        } catch {
          try {
            const parts = credential.split('.');
            if (parts.length >= 2) {
              const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
              email = (decoded.email || '').toLowerCase().trim();
              name = decoded.name || email.split('@')[0];
              avatarUrl = decoded.picture || '';
            }
          } catch {
            // handled below
          }
        }
      }

      if (!email && profileData?.email) {
        email = profileData.email.toLowerCase().trim();
        name = profileData.name || email.split('@')[0];
        avatarUrl = profileData.avatarUrl || '';
      }

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Unable to verify Google credential. Please ensure a valid Google account is selected.',
        });
        return;
      }

      await AuthController.provisionAndLoginGoogleUser(email, name, avatarUrl, role, req, res);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Google authentication failed.' });
    }
  }

  public static async getGoogleConfig(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      configured: !!config.googleClientId,
      clientId: config.googleClientId,
      clientSecretConfigured: !!config.googleClientSecret,
    });
  }

  public static async saveGoogleClientId(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.body;
      if (!clientId || typeof clientId !== 'string') {
        res.status(400).json({ success: false, message: 'Valid clientId is required.' });
        return;
      }

      config.googleClientId = clientId.trim();

      const envPaths = [
        path.resolve(process.cwd(), '../.env'),
        path.resolve(process.cwd(), '.env'),
      ];

      for (const envPath of envPaths) {
        if (fs.existsSync(envPath)) {
          let content = fs.readFileSync(envPath, 'utf-8');
          if (content.includes('GOOGLE_CLIENT_ID=')) {
            content = content.replace(/GOOGLE_CLIENT_ID=.*/g, `GOOGLE_CLIENT_ID=${config.googleClientId}`);
          } else {
            content += `\nGOOGLE_CLIENT_ID=${config.googleClientId}`;
          }

          if (content.includes('VITE_GOOGLE_CLIENT_ID=')) {
            content = content.replace(/VITE_GOOGLE_CLIENT_ID=.*/g, `VITE_GOOGLE_CLIENT_ID=${config.googleClientId}`);
          } else {
            content += `\nVITE_GOOGLE_CLIENT_ID=${config.googleClientId}`;
          }
          fs.writeFileSync(envPath, content, 'utf-8');
        }
      }

      res.status(200).json({
        success: true,
        message: 'Google Client ID saved successfully to environment.',
        clientId: config.googleClientId,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to save Google Client ID.' });
    }
  }

  public static async initiateGoogleOAuth(req: Request, res: Response): Promise<void> {
    try {
      const role = (req.query.role as string) || 'patient';
      const clientId = (config.googleClientId || '').trim();

      if (!clientId) {
        return res.redirect(
          `${config.clientUrl}/auth/google/callback?error=${encodeURIComponent(
            'GOOGLE_CLIENT_ID is not configured on the backend server.'
          )}`
        );
      }

      const callbackUrl = config.googleCallbackUrl;
      const scope = encodeURIComponent('openid email profile');
      const state = encodeURIComponent(JSON.stringify({ role, clientId }));

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;

      res.redirect(authUrl);
    } catch (error: any) {
      console.error('[Google OAuth Initiate Error]', error);
      res.redirect(
        `${config.clientUrl}/auth/google/callback?error=${encodeURIComponent(
          error.message || 'Failed to initiate Google OAuth.'
        )}`
      );
    }
  }

  public static async handleGoogleCallbackGet(req: Request, res: Response): Promise<void> {
    try {
      const { code, state, error, error_description } = req.query;

      if (error || error_description) {
        const errMsg = (error_description || error || 'Google authentication was cancelled or rejected.') as string;
        return res.redirect(`${config.clientUrl}/auth/google/callback?error=${encodeURIComponent(errMsg)}`);
      }

      if (!code || typeof code !== 'string') {
        return res.redirect(
          `${config.clientUrl}/auth/google/callback?error=${encodeURIComponent('No authorization code was provided by Google.')}`
        );
      }

      if (!config.googleClientId || !config.googleClientSecret) {
        return res.redirect(
          `${config.clientUrl}/auth/google/callback?error=${encodeURIComponent('Google OAuth credentials are not configured on backend.')}`
        );
      }

      let role: any = 'patient';
      try {
        if (state && typeof state === 'string') {
          const parsed = JSON.parse(decodeURIComponent(state));
          role = parsed.role || 'patient';
        }
      } catch {
        role = (state as string) || 'patient';
      }

      const callbackUrl = config.googleCallbackUrl;

      // Exchange authorization code for tokens with Google OAuth
      const tokenRes = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          code,
          client_id: config.googleClientId,
          client_secret: config.googleClientSecret,
          redirect_uri: callbackUrl,
          grant_type: 'authorization_code',
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10000,
        }
      );

      const { access_token } = tokenRes.data;

      // Fetch user profile from Google's official userinfo endpoint
      const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
        timeout: 10000,
      });

      const profile = userInfoRes.data;
      const email = (profile.email || '').toLowerCase().trim();
      const name = profile.name || profile.given_name || email.split('@')[0];
      const avatarUrl = profile.picture || '';

      if (!email) {
        return res.redirect(
          `${config.clientUrl}/auth/google/callback?error=${encodeURIComponent('Could not extract email address from Google profile.')}`
        );
      }

      const { token, user } = await AuthController.provisionGoogleUser(email, name, avatarUrl, role, req);
      const encodedUser = encodeURIComponent(JSON.stringify(user));

      return res.redirect(
        `${config.clientUrl}/auth/google/callback?token=${encodeURIComponent(token)}&user=${encodedUser}`
      );
    } catch (error: any) {
      const errData = error.response?.data;
      console.error('[GoogleCallback GET Error]', {
        status: error.response?.status,
        error: errData?.error,
        error_description: errData?.error_description,
      });
      const msg =
        errData?.error_description ||
        errData?.error ||
        error.message ||
        'Google OAuth exchange failed.';
      return res.redirect(`${config.clientUrl}/auth/google/callback?error=${encodeURIComponent(msg)}`);
    }
  }

  public static async getGoogleAuthUrl(req: Request, res: Response): Promise<void> {
    try {
      const role = (req.query.role as string) || 'admin';
      const clientId = (config.googleClientId || (req.query.clientId as string) || '').trim();

      if (!clientId) {
        res.status(400).json({
          success: false,
          message: 'GOOGLE_CLIENT_ID is not configured. Please supply your Google Cloud Client ID.',
        });
        return;
      }

      const redirectUri = config.googleCallbackUrl;
      const scope = encodeURIComponent('openid email profile');
      const state = encodeURIComponent(JSON.stringify({ role, clientId }));

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;

      res.status(200).json({
        success: true,
        url: authUrl,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to generate Google auth URL' });
    }
  }

  public static async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code, role, clientId, redirectUri: customRedirectUri } = req.body;

      if (!code) {
        res.status(400).json({ success: false, message: 'Authorization code is required from Google.' });
        return;
      }

      const effectiveClientId = (config.googleClientId || (clientId as string) || '').trim();
      if (!effectiveClientId) {
        res.status(400).json({ success: false, message: 'Google Client ID is missing.' });
        return;
      }

      const redirectUri = customRedirectUri || config.googleCallbackUrl;

      // Exchange authorization code for tokens with Google OAuth
      const tokenRes = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          code,
          client_id: effectiveClientId,
          client_secret: config.googleClientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10000,
        }
      );

      const { access_token } = tokenRes.data;

      // Fetch user profile from Google's official userinfo endpoint
      const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
        timeout: 10000,
      });

      const profile = userInfoRes.data;
      const email = (profile.email || '').toLowerCase().trim();
      const name = profile.name || profile.given_name || email.split('@')[0];
      const avatarUrl = profile.picture || '';

      if (!email) {
        res.status(400).json({ success: false, message: 'Could not extract email from Google profile.' });
        return;
      }

      await AuthController.provisionAndLoginGoogleUser(email, name, avatarUrl, role, req, res);
    } catch (error: any) {
      console.error('[GoogleCallback Error]', error.response?.data || error.message);
      const msg =
        error.response?.data?.error_description ||
        error.response?.data?.error ||
        error.message ||
        'Google OAuth exchange failed.';
      res.status(500).json({ success: false, message: msg });
    }
  }

  public static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ success: false, message: 'Please enter your registered email address.' });
        return;
      }

      const cleanEmail = email.toLowerCase().trim();
      const user = await User.findOne({ email: cleanEmail });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'No account was found with this email address. Please check and try again.',
        });
        return;
      }

      // Generate a mock reset token
      const resetToken = Buffer.from(`${user._id}:${Date.now()}`).toString('base64');
      const resetLink = `/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(cleanEmail)}`;

      res.status(200).json({
        success: true,
        message: 'Password reset instructions ready. Use the secure reset link below to update your password.',
        resetToken,
        resetLink,
      });
    } catch (error: any) {
      console.error('[ForgotPassword Error]', error);
      res.status(500).json({ success: false, message: 'Could not process password reset request.' });
    }
  }

  public static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, token, newPassword } = req.body;
      if (!email || !newPassword) {
        res.status(400).json({ success: false, message: 'Email and new password are required.' });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
        return;
      }

      const cleanEmail = email.toLowerCase().trim();
      const user = await User.findOne({ email: cleanEmail });

      if (!user) {
        res.status(404).json({ success: false, message: 'Account not found.' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(newPassword, salt);
      user.passwordHash = newHash;
      user.password_hash = newHash;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Your password has been successfully reset! You can now login with your new credentials.',
      });
    } catch (error: any) {
      console.error('[ResetPassword Error]', error);
      res.status(500).json({ success: false, message: 'Failed to reset password. Please try again.' });
    }
  }
}
