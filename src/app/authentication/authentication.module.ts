// Angular
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

// Vendor
import { SuiModule } from 'ng2-semantic-ui';

// Imports
import { SharedModule } from 'src/app/shared/shared.module';

// Providers
import { NoSessionGuardService } from 'src/app/services/access/no-session-guard.service';

// Components
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { InvitationComponent } from './components/invitation/invitation.component';

const routes: Routes = [
  {
    path: 'invitation/:token',
    component: InvitationComponent,
    data: { title: 'Invitation' },
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [NoSessionGuardService],
    data: { title: 'Sign Up' },
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'signin',
    component: SigninComponent,
    canActivate: [NoSessionGuardService],
    data: { title: 'Sign In' },
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [NoSessionGuardService],
    data: { title: 'Forgot Password' },
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'reset-password/:userID/:token',
    component: ResetPasswordComponent,
    canActivate: [NoSessionGuardService],
    data: { title: 'Reset Password' },
    runGuardsAndResolvers: 'always',
  }
];

@NgModule({
  imports: [
    SuiModule,
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    SigninComponent,
    SignupComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    InvitationComponent,
  ],
  exports: [
    SigninComponent,
    SignupComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    InvitationComponent,
    RouterModule,
  ],
  providers: [
    NoSessionGuardService,
  ],
})
export class AuthenticationModule { }
