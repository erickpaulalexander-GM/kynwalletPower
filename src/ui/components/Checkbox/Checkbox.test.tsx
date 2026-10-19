import { createRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '@/test/a11y';
import { Checkbox } from './Checkbox';

function Controlled() {
  const [checked, setChecked] = useState(false);
  return <Checkbox label="Recordarme" checked={checked} onChange={setChecked} />;
}

describe('Checkbox', () => {
  it('US5-2: casilla con etiqueta que alterna su estado', async () => {
    render(<Controlled />);
    const checkbox = screen.getByRole('checkbox', { name: 'Recordarme' });
    expect(checkbox).not.toBeChecked();
    expect(checkbox).not.toHaveAttribute('aria-invalid');
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    await userEvent.click(screen.getByText('Recordarme'));
    expect(checkbox).not.toBeChecked();
  });

  it('FR-006: expone aria-invalid y descripción accesible cuando recibe error', () => {
    render(
      <Checkbox
        label="Acepto los términos y condiciones"
        checked={false}
        error="Debes aceptar los términos y condiciones"
        onChange={() => {}}
      />,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' });
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    expect(checkbox).toHaveAccessibleDescription('Debes aceptar los términos y condiciones');
    expect(screen.getByText('Debes aceptar los términos y condiciones')).toBeVisible();
  });

  it('FR-006: reenvía ref al input para permitir mover el foco', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Checkbox
        ref={ref}
        label="Acepto los términos y condiciones"
        checked={false}
        onChange={() => {}}
      />,
    );
    ref.current?.focus();
    expect(
      screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }),
    ).toHaveFocus();
  });

  it('FR-015: no tiene violaciones de accesibilidad sin error ni con error visible', async () => {
    const { container, rerender } = render(<Controlled />);
    await expectNoA11yViolations(container);

    rerender(
      <Checkbox
        label="Acepto los términos y condiciones"
        checked={false}
        error="Debes aceptar los términos y condiciones"
        onChange={() => {}}
      />,
    );
    await expectNoA11yViolations(container);
  });

  it('admite label como ReactNode manteniendo el nombre accesible completo', async () => {
    const { container } = render(
      <Checkbox
        label={
          <>
            Acepto los <span>términos y condiciones</span>
          </>
        }
        checked={false}
        onChange={() => {}}
      />,
    );
    expect(
      screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }),
    ).toBeInTheDocument();
    expect(screen.getByText('términos y condiciones').tagName).toBe('SPAN');
    await expectNoA11yViolations(container);
  });
});
