import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import formatValue from '../../utils/formatValue';

import { Container, CardContainer, Card, TableContainer } from './styles';

interface TransactionsResponse {
  transactions: [
    {
      id: string;
      title: string;
      value: number;
      type: 'income' | 'outcome';
      category: {
        title: string;
      };
      created_at: Date;
    },
  ];
  balance: Balance;
}
interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: Date;
}

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);

  function parseTransactionsReponse(
    transactionsReponse: TransactionsResponse,
  ): Transaction[] {
    return transactionsReponse.transactions.map(transaction => {
      const created_at = new Date(transaction.created_at);

      return {
        id: transaction.id,
        title: transaction.title,
        formattedValue: formatValue(transaction.value),
        formattedDate: format(created_at, 'dd/MM/yyyy'),
        type: transaction.type,
        category: transaction.category,
        created_at,
      };
    }) as Transaction[];
  }

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      const transactionsResponse = await api.get<TransactionsResponse>(
        '/transactions',
      );

      if (!transactionsResponse.data) {
        return;
      }

      setTransactions(parseTransactionsReponse(transactionsResponse.data));
      setBalance(transactionsResponse.data.balance);
    }
    loadTransactions();
  }, []);

  return (
    <>
      <Header />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={income} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{formatValue(balance.income)}</h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcome} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">
              {formatValue(balance.outcome)}
            </h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={total} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{formatValue(balance.total)}</h1>
          </Card>
        </CardContainer>

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map(transaction => {
                return (
                  <tr key={`${transaction.id}`}>
                    <td className="title">{transaction.title}</td>
                    <td className={transaction.type}>
                      {transaction.formattedValue}
                    </td>
                    <td>{transaction.category.title}</td>
                    <td>{transaction.formattedDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
