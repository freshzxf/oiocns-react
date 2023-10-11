import FullScreenModal from '@/components/Common/fullScreen';
import React from 'react';

interface IProps {
  title: string;
  finished: () => void;
  children: React.ReactNode;
}

const FullModal: React.FC<IProps> = ({ title, finished, children }) => {
  return (
    <FullScreenModal
      open
      centered
      fullScreen
      width={'80vw'}
      bodyHeight={'80vh'}
      destroyOnClose
      title={title}
      onCancel={() => finished()}>
      {children}
    </FullScreenModal>
  );
};

export { FullModal };