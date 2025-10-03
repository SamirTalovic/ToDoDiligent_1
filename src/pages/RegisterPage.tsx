import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Paper,
  Link,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";
import agent from "../api/agent";
import { RegisterRequestDto } from "../common/interfaces/AuthInterface";

const initialValues: RegisterRequestDto = {
  name: "",
  email: "",
  password: "",
};

const validate = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Email is invalid").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .matches(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .required("Password is required"),
});

const RegisterPage = () => {
  const setUser = useUserStore((state) => state.setUser);
  const navigate = useNavigate();

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
          Register
        </Typography>

        <Formik
          initialValues={initialValues}
          validationSchema={validate}
          onSubmit={async (values, { setStatus, setSubmitting }) => {
            try {
              const response = await agent.AccountRequests.register(values);

              setUser({
                id: response.id,
                name: response.name,
                email: response.email,
                token: response.token,
              });

              navigate("/"); // ✅ redirect after register
            } catch (err: any) {
              setStatus("Registration failed. Try again.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, dirty, status, errors, touched }) => (
            <Form>
              {/* Name */}
              <Field
                as={TextField}
                name="name"
                label="Name"
                fullWidth
                margin="normal"
                error={touched.name && !!errors.name}
                helperText={touched.name && errors.name}
              />

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

              {/* Submit */}
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
                  "Register"
                )}
              </Button>

              {/* Link back to login */}
              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                Already have an account?{" "}
                <Link component={RouterLink} to="/login">
                  Login here
                </Link>
              </Typography>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default RegisterPage;
