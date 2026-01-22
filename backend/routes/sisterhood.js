const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');
const { signupValidation, validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// Rate limiting for signup endpoint
const rateLimit = require('express-rate-limit');
const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 attempts per hour
    message: {
        error: 'Too many signup attempts',
        message: 'Too many signup attempts from this IP, please try again later.'
    }
});

/**
 * POST /api/sisterhood/signup
 * Register a new participant for the Sisterhood Initiative (public endpoint)
 */
router.post('/signup', signupLimiter, signupValidation, validate, async (req, res) => {
    try {
        const {
            full_name,
            email,
            phone,
            referral_source,
            goals,
            newsletter_opt_in
        } = req.body;

        // Check for existing email
        const { data: existing, error: checkError } = await supabase
            .from('sisterhood_signups')
            .select('id')
            .ilike('email', email)
            .maybeSingle();

        if (checkError) {
            console.error('Email check error:', checkError);
        }

        if (existing) {
            return res.status(409).json({
                error: 'Email already registered',
                message: 'This email is already signed up for the Sisterhood Initiative.'
            });
        }

        // Insert new signup
        const { data, error } = await supabase
            .from('sisterhood_signups')
            .insert([{
                full_name,
                email: email.toLowerCase(),
                phone,
                referral_source: referral_source || null,
                goals: goals || null,
                newsletter_opt_in: newsletter_opt_in !== false,
                status: 'pending',
                entry_source: 'online'
            }])
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);

            if (error.code === '23505') {
                return res.status(409).json({
                    error: 'Email already registered',
                    message: 'This email is already signed up.'
                });
            }

            return res.status(500).json({
                error: 'Failed to save signup',
                message: 'We couldn\'t process your signup. Please try again.'
            });
        }

        console.log(`New Sisterhood signup: ${data.full_name} (${data.email})`);

        res.status(201).json({
            success: true,
            message: 'Thank you for signing up for the Sisterhood Initiative!',
            data: {
                full_name: data.full_name,
                email: data.email,
                created_at: data.created_at
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'An unexpected error occurred. Please try again.'
        });
    }
});

/**
 * GET /api/sisterhood/signups
 * Get all signups (admin only - requires authentication)
 */
router.get('/signups', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('sisterhood_signups')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch error:', error);
            return res.status(500).json({ error: 'Failed to fetch signups' });
        }

        res.json({ success: true, data });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * GET /api/sisterhood/signups/:id
 * Get a single signup by ID (admin only)
 */
router.get('/signups/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('sisterhood_signups')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return res.status(404).json({ error: 'Signup not found' });
        }

        res.json({ success: true, data });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * POST /api/sisterhood/signups
 * Create a new signup manually (admin only)
 */
router.post('/signups', authenticateToken, async (req, res) => {
    try {
        const {
            full_name,
            email,
            phone,
            referral_source,
            goals,
            newsletter_opt_in,
            status,
            notes,
            entry_source
        } = req.body;

        if (!full_name || !email || !phone) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'Full name, email, and phone are required.'
            });
        }

        const { data, error } = await supabase
            .from('sisterhood_signups')
            .insert([{
                full_name,
                email: email.toLowerCase(),
                phone,
                referral_source: referral_source || null,
                goals: goals || null,
                newsletter_opt_in: newsletter_opt_in !== false,
                status: status || 'pending',
                notes: notes || null,
                entry_source: entry_source || 'manual'
            }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Email already registered' });
            }
            return res.status(500).json({ error: 'Failed to create signup' });
        }

        res.status(201).json({ success: true, data });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * PUT /api/sisterhood/signups/:id
 * Update a signup (admin only)
 */
router.put('/signups/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove fields that shouldn't be updated
        delete updateData.id;
        delete updateData.created_at;

        const { data, error } = await supabase
            .from('sisterhood_signups')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: 'Failed to update signup' });
        }

        res.json({ success: true, data });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * DELETE /api/sisterhood/signups/:id
 * Delete a signup (admin only)
 */
router.delete('/signups/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('sisterhood_signups')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(500).json({ error: 'Failed to delete signup' });
        }

        res.json({ success: true, message: 'Signup deleted' });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;