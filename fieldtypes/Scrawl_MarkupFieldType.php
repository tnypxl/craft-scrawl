<?php

/**
 * Scrawl is a simple markdown plugin for Craft CMS providing a fieldtype and a twig filter.
 *
 * @package   Craft Scrawl
 * @author    Mario Friz
 */

namespace Craft;

class Scrawl_MarkupFieldType extends BaseFieldType
{
    /**
     * Returns the type of field this is.
     *
     * @return string
     */
    public function getName()
    {
        return Craft::t('Markup');
    }

    /**
     * Defines the settings.
     *
     * @access protected
     * @return array
     */
    protected function defineSettings()
    {
        return array(
            'mode'  => AttributeType::String
        );
    }

    /**
     * Returns the field's settings HTML.
     *
     * @return string|null
     */
    public function getSettingsHtml()
    {
        $modesPath = craft()->path->getPluginsPath().'scrawl/resources/js/modes/';
        if (IOHelper::folderExists($modesPath))
        {
            $modeFiles = IOHelper::getFolderContents($modesPath, false);

            if (is_array($modeFiles))
            {
                foreach ($modeFiles as $file)
                {
                    $modeOptions[IOHelper::getFileName($file)] = ucwords(IOHelper::getFileName($file, false));
                }
            }
        }

        return craft()->templates->render('scrawl/settings', array(
            'settings' => $this->getSettings(),
            'modeOptions' => $modeOptions
        ));
    }

    /**
     * Returns the content attribute config.
     *
     * @return mixed
     */
    public function defineContentAttribute()
    {
        return array(AttributeType::String, 'column' => ColumnType::Text);
    }

    /**
     * Returns the field's input HTML.
     *
     * @param string $name
     * @param mixed  $value
     * @return string
     */
    public function getInputHtml($name, $value)
    {
        $settings = $this->getSettings();

        craft()->templates->includeJsResource('scrawl/js/marked.js');
        craft()->templates->includeJsResource('scrawl/js/codemirror/codemirror.js');

        // Include the correct markup language mode
        $pluginPath = craft()->path->getPluginsPath().'scrawl/';
        if (IOHelper::fileExists($pluginPath.'/resources/js/modes/'.$settings->mode, true)) {
            craft()->templates->includeJsResource('scrawl/js/modes/'.$settings->mode);
        }

        $mode = IOHelper::getFileName($pluginPath.'/resources/js/modes/'.$settings->mode, false);
        
        craft()->templates->includeCssResource('scrawl/css/scrawl.css');

        return craft()->templates->render('scrawl/input', array(
            'name'     => $name,
            'value'    => $value,
            'mode'     => $mode
        ));
    }
}