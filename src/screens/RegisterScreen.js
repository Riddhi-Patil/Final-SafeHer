import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { register as registerUser } from '../utils/auth';

// Simple email regex (good enough for basic validation)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  function validateInputs() {
    const newErrors = { name: '', email: '', password: '', confirmPassword: '' };
    
    if (!name.trim()) newErrors.name = 'Name is required.';
    
    if (!email.trim()) newErrors.email = 'Email is required.';
    else if (!emailRegex.test(email.trim())) newErrors.email = 'Enter a valid email address.';

    if (!password) newErrors.password = 'Password is required.';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.';

    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password.';
    else if (confirmPassword !== password) newErrors.confirmPassword = 'Passwords do not match.';

    setErrors(newErrors);
    // return true if no errors
    return !newErrors.name && !newErrors.email && !newErrors.password && !newErrors.confirmPassword;
  }

  async function handleRegister() {
    // first validate
    if (!validateInputs()) return;

    // show loading
    setLoading(true);

    try {
      const result = await registerUser({ name: name.trim(), email: email.trim(), password });
      if (result.ok) {
        Alert.alert(
          'Registration Successful',
          'Your account has been created successfully!',
          [{ text: 'OK', onPress: () => navigation.navigate('Main') }]
        );
      } else {
        Alert.alert('Registration Failed', result.error || 'Could not create account.');
      }
    } catch (err) {
      Alert.alert('Something went wrong', 'Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  }

  const isFormValid = name.trim() && emailRegex.test(email.trim()) && 
                      password.length >= 6 && password === confirmPassword;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Full Name"
          value={name}
          onChangeText={text => setName(text)}
          onBlur={validateInputs}
          style={styles.input}
        />
        {errors.name ? <Text style={styles.error}>{errors.name}</Text> : null}
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={text => setEmail(text)}
          onBlur={validateInputs}
          style={styles.input}
        />
        {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={text => setPassword(text)}
          onBlur={validateInputs}
          style={styles.input}
        />
        {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={text => setConfirmPassword(text)}
          onBlur={validateInputs}
          style={styles.input}
        />
        {errors.confirmPassword ? <Text style={styles.error}>{errors.confirmPassword}</Text> : null}
      </View>

      <TouchableOpacity
        style={[styles.button, !isFormValid || loading ? styles.buttonDisabled : null]}
        onPress={handleRegister}
        disabled={!isFormValid || loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Register'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 40, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', color: '#6b46c1', marginBottom: 24 },
  inputWrapper: { width: '100%', marginBottom: 12 },
  input: {
    width: '100%',
    borderRadius: 12,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff'
  },
  error: { color: '#c53030', marginTop: 6, marginLeft: 6 },
  button: {
    width: '100%',
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 40,
    backgroundColor: '#6b46c1',
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '700' },
  loginLink: { marginTop: 18 },
  loginText: { color: '#6b46c1' }
});