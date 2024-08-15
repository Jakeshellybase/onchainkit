import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useChainId } from 'wagmi';
import { useShowCallsStatus } from 'wagmi/experimental';
import { getChainExplorer } from '../../network/getChainExplorer';
import { useTransactionContext } from '../components/TransactionProvider';
import { useGetTransactionStatusAction } from './useGetTransactionStatusAction';

vi.mock('../components/TransactionProvider', () => ({
  useTransactionContext: vi.fn(),
}));

vi.mock('wagmi', () => ({
  useChainId: vi.fn(),
}));

vi.mock('wagmi/experimental', () => ({
  useShowCallsStatus: vi.fn(),
}));

vi.mock('../../network/getChainExplorer', () => ({
  getChainExplorer: vi.fn(),
}));

const mockGetChainExplorer = 'https://etherscan.io';

describe('useGetTransactionStatusAction', () => {
  beforeEach(() => {
    (useChainId as vi.Mock).mockReturnValue(123);
    (useShowCallsStatus as vi.Mock).mockReturnValue({
      showCallsStatus: vi.fn(),
    });
    (getChainExplorer as vi.Mock).mockReturnValue(mockGetChainExplorer);
  });

  it('should return actionElement when transaction hash exists', () => {
    (useTransactionContext as vi.Mock).mockReturnValue({
      transactionHash: '0x123',
    });

    const { result } = renderHook(() => useGetTransactionStatusAction());

    expect(result.current.actionElement).toMatchInlineSnapshot(`
        <a
          href="https://etherscan.io/tx/0x123"
          rel="noreferrer"
          target="_blank"
        >
          <span
            className="font-bold font-sans text-sm leading-5 text-ock-primary"
          >
            View transaction
          </span>
        </a>
      `);
  });

  it('should return actionElement when transaction id exists', () => {
    (useTransactionContext as vi.Mock).mockReturnValue({
      transactionId: 'ab123',
      onSubmit: vi.fn(),
    });

    const showCallsStatus = vi.fn();
    (useShowCallsStatus as vi.Mock).mockReturnValue({ showCallsStatus });

    const { result } = renderHook(() => useGetTransactionStatusAction());

    const button = result.current.actionElement as JSX.Element;
    expect(button.props.onClick).toBeDefined();
    expect(button).not.toBeNull();
  });

  it('should return null when receipt exists', () => {
    (useTransactionContext as vi.Mock).mockReturnValue({
      receipt: 'receipt',
      transactionHash: '123',
    });

    const { result } = renderHook(() => useGetTransactionStatusAction());

    expect(result.current.actionElement).toBeNull();
  });

  it('should return actionElement when error occurs', () => {
    (useTransactionContext as vi.Mock).mockReturnValue({
      errorMessage: 'error',
    });

    const { result } = renderHook(() => useGetTransactionStatusAction());

    expect(result.current.actionElement).toBeNull();
  });

  it('should return actionElement when no status available', () => {
    (useTransactionContext as vi.Mock).mockReturnValue({
      errorMessage: '',
    });

    const { result } = renderHook(() => useGetTransactionStatusAction());

    expect(result.current.actionElement).toBeNull();
  });

  it('should call showCallsStatus when button is clicked', () => {
    const showCallsStatus = vi.fn();
    (useShowCallsStatus as vi.Mock).mockReturnValue({ showCallsStatus });
    (useTransactionContext as vi.Mock).mockReturnValue({
      transactionId: 'ab123',
    });

    const { result } = renderHook(() => useGetTransactionStatusAction());

    const button = result.current.actionElement as JSX.Element;
    button.props.onClick();

    expect(showCallsStatus).toHaveBeenCalledWith({ id: 'ab123' });
  });
});