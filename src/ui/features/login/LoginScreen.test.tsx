import { render, screen } from '@testing-library/react';
import logoMark from '@/ui/assets/logo-mark.svg';
import logoMarkRegister from '@/ui/assets/logo-mark-register.svg';
import { LoginScreen } from './LoginScreen';

describe('LoginScreen', () => {
  it('US5-1: muestra por defecto el panel de marca de login y el contenido sin hideBrandOnMobile', () => {
    const { container } = render(
      <LoginScreen>
        <p>Contenido del formulario</p>
      </LoginScreen>,
    );
    const banner = screen.getByRole('banner');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveTextContent('Tu dinero,sin fronteras.');
    expect(banner).toHaveTextContent(
      'Envía, recibe y paga en segundos. Una billetera pensada para tu día a día.',
    );
    const logoImg = banner.querySelector('img');
    expect(logoImg).toHaveAttribute('src', logoMark);
    expect(logoImg).toHaveAttribute('width', '20');
    expect(logoImg).toHaveAttribute('height', '44');
    const chip = banner.querySelector('.chip');
    expect(chip).toBeInTheDocument();
    expect(chip).not.toHaveClass('chipRegister');
    expect(screen.getByRole('main')).toHaveTextContent('Contenido del formulario');
    expect(container.firstElementChild).not.toHaveClass('hideBrandOnMobile');
  });

  it('US5-2: aplica la clase hideBrandOnMobile y los textos de registro cuando variant="register" (FR-011)', () => {
    const { container } = render(
      <LoginScreen variant="register" hideBrandOnMobile>
        <p>Formulario de registro</p>
      </LoginScreen>,
    );
    const banner = screen.getByRole('banner');
    expect(banner).toHaveTextContent('Comienza tu camino financiero.');
    expect(banner).toHaveTextContent(
      'Crea tu cuenta en minutos y empieza a enviar, recibir y administrar tu dinero desde cualquier lugar.',
    );
    const logoImg = banner.querySelector('img');
    expect(logoImg).toHaveAttribute('src', logoMarkRegister);
    expect(logoImg).toHaveAttribute('width', '20');
    expect(logoImg).toHaveAttribute('height', '28');
    const chip = banner.querySelector('.chip');
    expect(chip).toHaveClass('chipRegister');
    expect(screen.getByRole('main')).toHaveTextContent('Formulario de registro');
    expect(container.firstElementChild).toHaveClass('hideBrandOnMobile');
  });
});
