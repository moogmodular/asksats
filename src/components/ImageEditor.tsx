import FilerobotImageEditor, { TABS, TOOLS } from 'react-filerobot-image-editor'
import { watermarkState } from '~/assets/watermark-state'

type SavedImageData = {
    name: string
    extension: string
    mimeType: string
    fullName?: string
    height?: number
    width?: number
    imageBase64?: string
    imageCanvas?: HTMLCanvasElement // doesn't support quality
    quality?: number
    cloudimageUrl?: string
}

type ImageDesignState = {
    imgSrc?: string
    finetunes?: string[]
    finetunesProps?: {
        brightness?: number
        contrast?: number
        hue?: number
        saturation?: number
        value?: number
        blurRadius?: number
        warmth?: number
    }
    filter?: string
    adjustments?: {
        crop: {
            ratio: string
            width?: number
            height?: number
            x?: number
            y?: number
            ratioFolderKey?: string
            ratioGroupKey?: string
            ratioTitleKey?: string
        }
        isFlippedX?: boolean
        isFlippedY?: boolean
        rotation?: number
    }
    annotations?: any
    resize?: {
        width?: number
        height?: number
        manualChangeDisabled?: boolean
    }
    shownImageDimensions?: {
        width: number
        height: number
        scaledBy: number
    }
}

export type DesignStatePreset = 'none' | 'blur' | 'checker' | 'contrast' | 'black_white'
interface ImageEditorProps {
    currentImage: string
    editedImage: (image: string) => void
    preset?: DesignStatePreset
}

export const ImageEditor = ({ currentImage, editedImage, preset }: ImageEditorProps) => {
    const handleImageEdited = (editedImageObject: SavedImageData) => {
        editedImage(editedImageObject.imageBase64 ?? '')
    }

    const getPresetDesignState = (preset?: DesignStatePreset) => {
        return preset
            ? {
                  none: {},
                  blur: {
                      finetunes: [TOOLS.BLUR],
                      finetunesProps: { blurRadius: 60 },
                  },
                  checker: watermarkState(),
                  contrast: {
                      finetunes: [TOOLS.CONTRAST],
                      finetunesProps: { contrast: 60 },
                  },
                  black_white: {
                      filter: 'grayscale',
                  },
              }[preset]
            : {}
    }

    return (
        <div style={{ height: '80vh' }}>
            <FilerobotImageEditor
                source={currentImage ?? 'https://scaleflex.airstore.io/demo/stephen-walker-unsplash.jpg'}
                onSave={(editedImageObject, designState) => handleImageEdited(editedImageObject)}
                annotationsCommon={{
                    fill: '#ff0000',
                }}
                // showCanvasOnly={preset}
                closeAfterSave={true}
                loadableDesignState={getPresetDesignState(preset)}
                previewPixelRatio={1}
                savingPixelRatio={1}
                Rotate={{ angle: 90, componentType: 'slider' }}
                tabsIds={[TABS.ADJUST, TABS.FINETUNE, TABS.FILTERS, TABS.WATERMARK, TABS.ANNOTATE, TABS.RESIZE]}
                defaultTabId={TABS.ANNOTATE}
                defaultToolId={TOOLS.RECT}
            />
        </div>
    )
}
