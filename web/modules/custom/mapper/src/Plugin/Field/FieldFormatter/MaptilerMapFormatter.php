<?php

declare(strict_types=1);

namespace Drupal\mapper\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\geofield\Plugin\Field\FieldFormatter\LatLonFormatter;

/**
 * Plugin implementation of the 'Maptiler map' formatter.
 *
 * @FieldFormatter(
 *   id = "unep_map_maptiler_map",
 *   label = @Translation("Maptiler map"),
 *   field_types = {
 *     "geofield"
 *   }
 * )
 */
final class MaptilerMapFormatter extends LatLonFormatter {

  /**
   * {@inheritdoc}
   */
  protected function formatOptions() {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $elements = parent::settingsForm($form, $form_state);
    unset($elements['output_format']);
    return $elements;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $elements = [];

    foreach ($items as $delta => $item) {
      $output = ['#markup' => ''];
      $geom = $this->geoPhpWrapper->load($item->value);
      if ($geom) {
        // If the geometry is not a point, get the centroid.
        if ($geom->getGeomType() != 'Point') {
          $geom = $geom->centroid();
        }
        $lonlat = $geom->x() . ', ' . $geom->y();
        $output = [
          '#theme' => 'mapper',
          '#lonlat' => $lonlat,
          '#attached' => [
            'library' => ['mapper/maptiler-map'],
          ],
        ];
      }
      $elements[$delta] = $output;
    }

    return $elements;
  }

}
