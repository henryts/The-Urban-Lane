

// creating 24 hours from milliseconds

const oneDay = 1000 * 60 * 60 * 24;
//session middleware
router.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));
router.use(cookieParser());
