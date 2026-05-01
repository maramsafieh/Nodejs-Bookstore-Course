const express = require("express");
const logger = require("./middlewares/logger");
const { notFound, errorHandler } = require("./middlewares/errors");
require("dotenv").config();
const connectToDB = require("./config/db"); //
// الاتصال بقاعدة البيانات
connectToDB();

// تهيئة التطبيق
const app = express();

// استخدام الميدل وير
app.use(express.json());
app.use(logger);

// تعريف المسارات (Routes) بشكل مختصر
app.use("/api/books", require("./routes/books"));
app.use("/api/authors", require("./routes/authors"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));

// ميدل وير معالجة الأخطاء (يجب أن تكون في النهاية)
app.use(notFound);
app.use(errorHandler);

// تشغيل السيرفر
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});