import { Router } from 'express';

import {
    validateUser,
    getUsers,
    getSuperVisor
} from '../controllers/user.controller';

const router = Router();
const baseUrl = '/api/user/';

router.get(`${baseUrl}`, getUsers);
router.get(`${baseUrl}superVisor`, getSuperVisor);
router.post(`${baseUrl}validateSuperVisor`, validateUser);

export default router;