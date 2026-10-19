import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '@/test/a11y';
import socialIcon from '@/ui/assets/social-placeholder.svg';
import socialRegisterIcon from '@/ui/assets/social-placeholder-register.svg';
import { SocialButton } from './SocialButton';

describe('SocialButton', () => {
  it('botón con el nombre del proveedor e icono decorativo de login por defecto; invoca onClick', async () => {
    const onClick = vi.fn();
    const { container } = render(<SocialButton provider="Google" onClick={onClick} />);
    const button = screen.getByRole('button', { name: 'Google' });
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('src', socialIcon);
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('usa el icono específico de registro cuando variant="register"', () => {
    const { container } = render(
      <SocialButton provider="Google" variant="register" onClick={() => {}} />,
    );
    expect(container.querySelector('img')).toHaveAttribute('src', socialRegisterIcon);
  });

  it('FR-015: no tiene violaciones de accesibilidad', async () => {
    const { container } = render(<SocialButton provider="Apple" onClick={() => {}} />);
    await expectNoA11yViolations(container);
  });
});
