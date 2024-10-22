"use client";

import React, { useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import "@solana/wallet-adapter-react-ui/styles.css";

const SolanaActionComponent: React.FC = () => {
    const { publicKey } = useWallet();

    const handleSendMemo = useCallback(async () => {
        if (!publicKey) {
            alert("Please connect your wallet first.");
            return;
        }

        try {
            const account: PublicKey = publicKey;

            const response = await fetch('/api/actions/memo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ account: account.toString() }),
            });

            if (!response.ok) {
                throw new Error('Failed to send memo');
            }

            const result = await response.json();
            console.log('Transaction successful:', result);
        } catch (error) {
            console.error('Error sending memo:', error);
        }
    }, [publicKey]);

    return (
        <div>
            <WalletMultiButton />
            <button onClick={handleSendMemo}>Send Memo</button>
        </div>
    );
};

export default SolanaActionComponent;