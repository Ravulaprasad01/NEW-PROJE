import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AuthForm from './AuthForm';

interface LoginModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onOpenChange }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Login or Sign Up</DialogTitle>
          <DialogDescription>
            Enter your details to access the inventory request.
          </DialogDescription>
        </DialogHeader>
        <AuthForm onLoginSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
