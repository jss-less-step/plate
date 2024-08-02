import React from 'react';

import { render } from '@testing-library/react';
import { isBlock, setNodes } from '@udecode/slate';
import isEqual from 'lodash/isEqual.js';
import memoize from 'lodash/memoize.js';

import { type PlatePlugin, createPlugin } from '../../shared';
import { createPlateEditor } from '../utils';
import { Plate } from './Plate';
import { PlateContent } from './PlateContent';

describe('Plate', () => {
  describe('when normalizeInitialValue false', () => {
    // it('should trigger normalize if normalizeInitialValue set', () => {
    //   const fn = jest.fn((e: TEditor<V>, [node, path]) => {
    //     if (
    //       isBlock(e, node) &&
    //       path?.length &&
    //       !isEqual((node as any).path, path)
    //     ) {
    //       setNodes(e, { path } as any, { at: path });
    //     }
    //   });
    //
    //   const plugins: PlatePlugin[] = [
    //     {
    //       key: 'a',
    //       withOverrides: (e) => {
    //         const { normalizeNode } = e;
    //         e.normalizeNode = (n: TNodeEntry) => {
    //           fn(e, n);
    //           normalizeNode(n);
    //         };
    //         return e;
    //       },
    //     },
    //   ];
    //
    //   const component = (
    //     <Plate
    //       plugins={plugins}
    //       normalizeInitialValue
    //       initialValue={[{ children: [{ text: '' }] }]}
    //     />
    //   );
    //
    //   render(component);

    // expect(fn).toBeCalled();

    //   expect(getPlateEditorRef().children).toStrictEqual([
    //     { children: [{ text: '' }], path: [0] },
    //   ]);
    // });

    it('should not trigger normalize if normalizeInitialValue is not set to true', () => {
      const fn = jest.fn((e, [node, path]) => {
        if (
          isBlock(e, node) &&
          path?.length &&
          !isEqual((node as any).path, path)
        ) {
          setNodes(e, { path } as any, { at: path });
        }
      });

      const plugins: PlatePlugin[] = memoize((): PlatePlugin[] => [
        createPlugin({
          key: 'a',
          withOverrides: (e) => {
            const { normalizeNode } = e;
            e.normalizeNode = (n) => {
              fn(e, n);
              normalizeNode(n);
            };

            return e;
          },
        }),
      ])();

      const editor = createPlateEditor();

      render(
        <Plate
          editor={editor}
          initialValue={[{ children: [{ text: '' }] } as any]}
          plugins={plugins}
        >
          <PlateContent />
        </Plate>
      );

      expect(fn).not.toHaveBeenCalled();

      expect(editor.children).not.toStrictEqual([
        { children: [{ text: '' }], path: [0] },
      ]);
    });
  });

  describe('when renderAboveSlate renders null', () => {
    it('should not normalize editor children', () => {
      const plugins: PlatePlugin[] = [
        createPlugin({
          key: 'a',
          renderAboveSlate: () => {
            return null;
          },
        }),
      ];

      const editor = createPlateEditor({
        plugins,
      });

      expect(() =>
        render(
          <Plate editor={editor} initialValue={[{}] as any}>
            <PlateContent />
          </Plate>
        )
      ).not.toThrow();
    });
  });

  describe('when renderAboveSlate renders children', () => {
    it("should not trigger plugin's normalize", () => {
      const plugins: PlatePlugin[] = [
        createPlugin({
          key: 'a',
          renderAboveSlate: ({ children }) => {
            return <>{children}</>;
          },
        }),
      ];

      const editor = createPlateEditor({
        plugins,
      });

      expect(() =>
        render(
          <Plate editor={editor} initialValue={[{}] as any}>
            <PlateContent />
          </Plate>
        )
      ).toThrow();
    });
  });

  describe('when nested Plate', () => {
    it('should work', () => {
      const plugins: PlatePlugin[] = [
        createPlugin({
          component: ({ attributes, children }) => (
            <div {...attributes}>
              <Plate id="test">
                <PlateContent id="test" />
              </Plate>
              {children}
            </div>
          ),
          isElement: true,
          isVoid: true,
          key: 'a',
        }),
      ];

      const editor = createPlateEditor({
        plugins,
      });

      expect(() =>
        render(
          <Plate
            editor={editor}
            initialValue={[{ children: [{ text: '' }], type: 'a' }] as any}
          >
            <PlateContent />
          </Plate>
        )
      ).not.toThrow();
    });
  });
});
