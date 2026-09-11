import React from 'react';
import { render, screen } from '@/utils/test-utils';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';

describe('Themed Components', () => {
  describe('ThemedText', () => {
    it('renders with default type', () => {
      render(<ThemedText>Hello</ThemedText>);
      expect(screen.getByText('Hello')).toBeTruthy();
    });

    it('renders different types', () => {
        const { rerender } = render(<ThemedText type="title">Title</ThemedText>);
        expect(screen.getByText('Title')).toBeTruthy();

        rerender(<ThemedText type="subtitle">Subtitle</ThemedText>);
        expect(screen.getByText('Subtitle')).toBeTruthy();

        rerender(<ThemedText type="small">Small</ThemedText>);
        expect(screen.getByText('Small')).toBeTruthy();

        rerender(<ThemedText type="code">Code</ThemedText>);
        expect(screen.getByText('Code')).toBeTruthy();
    });
  });

  describe('ThemedView', () => {
    it('renders correctly', () => {
      const { toJSON } = render(<ThemedView />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with type backgroundElement', () => {
        const { toJSON } = render(<ThemedView type="backgroundElement" />);
        expect(toJSON()).toBeTruthy();
    });
  });
});
