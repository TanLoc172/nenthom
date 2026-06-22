import { SignUp } from '@clerk/clerk-react';
import AuthShell from '../components/AuthShell.jsx';

export default function Register() {
  return (
    <AuthShell>
      <SignUp
        routing="path"
        path="/register"
        signInUrl="/login"
        fallbackRedirectUrl="/"
        appearance={{
          elements: {
            rootBox:        { width: '100%' },
            card:           { boxShadow: 'none', padding: 0, background: 'transparent' },
            headerTitle:    { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 600 },
            headerSubtitle: { color: '#9b9289' },
            formButtonPrimary: { background: '#8B6B4A', borderRadius: 10, fontSize: 15, fontWeight: 600, '&:hover': { background: '#765939' } },
            formFieldInput: { borderRadius: 10, borderColor: '#F0E9DD', fontSize: 14 },
            footerActionLink: { color: '#8B6B4A', fontWeight: 600 },
            dividerLine: { background: '#F0E9DD' },
            dividerText: { color: '#9b9289' },
            socialButtonsBlockButton: { borderColor: '#F0E9DD', borderRadius: 10 },
          },
        }}
      />
    </AuthShell>
  );
}
