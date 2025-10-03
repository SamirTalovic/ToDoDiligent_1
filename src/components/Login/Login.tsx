import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { LoginRequestDto } from "../../common/interfaces/AuthInterface";
import { useUserStore } from "../../stores/userStore";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Paper,
  Link,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const initialValues: LoginRequestDto = {
  email: "",
  password: "",
};

const validate = Yup.object({
  email: Yup.string().email("Email is invalid").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export const Login = () => {
  const login = useUserStore((state) => state.login);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ backgroundColor: "background.default" }}
    >
      <Paper elevation={4} sx={{ p: 4, width: "100%", maxWidth: 400 }}>
        <Typography variant="h4" gutterBottom align="center">
          Login
        </Typography>

        <Formik
          initialValues={initialValues}
          validationSchema={validate}
          onSubmit={async (values, { setStatus, setSubmitting }) => {
            try {
              await login(values.email, values.password);
            } catch {
              setStatus("Invalid email or password");
            } finally {
              setSubmitting(false); // ✅ stop the spinner
            }
          }}

        >
          {({ isSubmitting, dirty, status, errors, touched }) => (
            <Form>
              {/* Email */}
              <Field
                as={TextField}
                name="email"
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                error={touched.email && !!errors.email}
                helperText={touched.email && errors.email}
              />

              {/* Password */}
              <Field
                as={TextField}
                name="password"
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                error={touched.password && !!errors.password}
                helperText={touched.password && errors.password}
              />

              {/* Status message */}
              {status && (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ mt: 1, mb: 1, textAlign: "center" }}
                >
                  {status}
                </Typography>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                disabled={isSubmitting || !dirty}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Login"
                )}
              </Button>
              <Typography
  variant="body2"
  align="center"
  sx={{ mt: 2 }}
>
  Don't have an account?{" "}
  <Link component={RouterLink} to="/register">
    Register here
  </Link>
</Typography>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};
