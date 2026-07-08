<?php

declare(strict_types=1);

namespace Drupal\navdata\Controller;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Cache\CacheableResponse;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\geofield\GeoPHP\GeoPHPInterface;
use Drupal\views\Views;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Exports storage entities as OpenAir airspace and SeeYou CUP waypoint files.
 *
 * Entities are fetched and filtered by the 'flight_data' view, so which
 * storage types end up in each file is configurable in the Views UI. Only the
 * type => class/style mappings below live in code.
 */
final class NavdataController extends ControllerBase {

  /**
   * The view (and its displays) used to fetch and filter storage entities.
   */
  private const VIEW_ID = 'flight_data';
  private const AIRSPACE_DISPLAY = 'airspace';
  private const WAYPOINTS_DISPLAY = 'waypoints';

  /**
   * Storage field_type => OpenAir airspace class. Unmapped types get default.
   */
  private const OPENAIR_CLASSES = [
    'landing' => 'W',
  ];
  private const OPENAIR_DEFAULT_CLASS = 'Q';

  /**
   * Storage field_type => SeeYou CUP waypoint style. Unmapped types get 0.
   */
  private const CUP_STYLES = [
    'landing' => 21,
    'takeoff' => 20,
    'obstacle' => 8,
    'poi' => 19,
  ];
  private const CUP_DEFAULT_STYLE = 0;

  public function __construct(
    private readonly GeoPHPInterface $geoPhp,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): self {
    return new self($container->get('geofield.geophp'));
  }

  /**
   * Builds the OpenAir airspace file from Polygon geometries.
   */
  public function openair(): CacheableResponse {
    $lines = [
      '* Ventorelativo - zone di volo (OpenAir)',
      '* Generated: ' . date('Y-m-d'),
      '',
    ];
    [$entities, $cacheability] = $this->executeView(self::AIRSPACE_DISPLAY);
    foreach ($entities as $entity) {
      $class = self::OPENAIR_CLASSES[$entity->get('field_type')->value] ?? self::OPENAIR_DEFAULT_CLASS;
      /** @var \Polygon $polygon */
      foreach ($this->extractGeometries($entity, 'Polygon') as $polygon) {
        $lines[] = 'AC ' . $class;
        $lines[] = 'AN ' . $entity->label();
        $lines[] = 'AL SFC';
        $lines[] = 'AH 100ft AGL';
        /** @var \LineString $outer_ring */
        $outer_ring = $polygon->getComponents()[0];
        foreach ($outer_ring->getPoints() as $point) {
          $lines[] = sprintf('DP %s %s', $this->toDms($point->y(), FALSE), $this->toDms($point->x(), TRUE));
        }
        $lines[] = '';
      }
    }
    return $this->fileResponse(implode("\n", $lines), $cacheability);
  }

  /**
   * Builds the SeeYou CUP waypoints file from Point geometries.
   */
  public function cup(): CacheableResponse {
    $lines = ['name,code,country,lat,lon,elev,style,rwdir,rwlen,rwwidth,freq,desc'];
    [$entities, $cacheability] = $this->executeView(self::WAYPOINTS_DISPLAY);
    foreach ($entities as $entity) {
      $style = self::CUP_STYLES[$entity->get('field_type')->value] ?? self::CUP_DEFAULT_STYLE;
      foreach ($this->extractGeometries($entity, 'Point') as $point) {
        $lines[] = sprintf(
          '"%s",,IT,%s,%s,,%d,,,,,',
          str_replace('"', '""', (string) $entity->label()),
          $this->toCupCoordinate($point->y(), FALSE),
          $this->toCupCoordinate($point->x(), TRUE),
          $style,
        );
      }
    }
    return $this->fileResponse(implode("\n", $lines) . "\n", $cacheability);
  }

  /**
   * Executes a display of the flight_data view and returns its entities.
   *
   * @return array{0: \Drupal\Core\Entity\ContentEntityInterface[], 1: \Drupal\Core\Cache\CacheableMetadata}
   *   The result entities and the view's cacheability metadata.
   */
  private function executeView(string $display_id): array {
    $view = Views::getView(self::VIEW_ID);
    if (!$view || !$view->setDisplay($display_id)) {
      throw new NotFoundHttpException();
    }
    $view->execute();
    $entities = array_map(static fn ($row) => $row->_entity, $view->result);
    $cacheability = (new CacheableMetadata())->setCacheTags($view->getCacheTags());
    return [$entities, $cacheability];
  }

  /**
   * Extracts all geometries of the given type from an entity's location.
   *
   * @return \Geometry[]
   *   The geometries of the requested type, if any.
   */
  private function extractGeometries(ContentEntityInterface $entity, string $type): array {
    $wkt = $entity->get('field_location')->value;
    $geometry = $wkt ? $this->geoPhp->load($wkt) : NULL;
    return $geometry ? $this->filterByType($geometry, $type) : [];
  }

  /**
   * Recursively collects geometries of one type out of collections.
   *
   * Only descends into containers (GeometryCollection, Multi*) so that e.g.
   * the vertices of a Polygon are never returned as Points.
   *
   * @return \Geometry[]
   *   The geometries of the requested type, if any.
   */
  private function filterByType(\Geometry $geometry, string $type): array {
    $geometry_type = $geometry->geometryType();
    if ($geometry_type === $type) {
      return [$geometry];
    }
    $found = [];
    if ($geometry instanceof \Collection && in_array($geometry_type, ['GeometryCollection', 'Multi' . $type], TRUE)) {
      foreach ($geometry->getComponents() as $component) {
        $found = array_merge($found, $this->filterByType($component, $type));
      }
    }
    return $found;
  }

  /**
   * Formats decimal degrees as OpenAir DMS (DD:MM:SS.SS N / DDD:MM:SS.SS E).
   */
  private function toDms(float $degrees, bool $is_longitude): string {
    $hemisphere = $is_longitude ? ($degrees >= 0 ? 'E' : 'W') : ($degrees >= 0 ? 'N' : 'S');
    $absolute = abs($degrees);
    $whole_degrees = (int) $absolute;
    $raw_minutes = ($absolute - $whole_degrees) * 60;
    $minutes = (int) $raw_minutes;
    $seconds = ($raw_minutes - $minutes) * 60;
    $format = $is_longitude ? '%03d:%02d:%05.2f %s' : '%02d:%02d:%05.2f %s';
    return sprintf($format, $whole_degrees, $minutes, $seconds, $hemisphere);
  }

  /**
   * Formats decimal degrees as CUP DDMM.mmmN / DDDMM.mmmE.
   */
  private function toCupCoordinate(float $degrees, bool $is_longitude): string {
    $hemisphere = $is_longitude ? ($degrees >= 0 ? 'E' : 'W') : ($degrees >= 0 ? 'N' : 'S');
    $absolute = abs($degrees);
    $whole_degrees = (int) $absolute;
    $minutes = ($absolute - $whole_degrees) * 60;
    $format = $is_longitude ? '%03d%06.3f%s' : '%02d%06.3f%s';
    return sprintf($format, $whole_degrees, $minutes, $hemisphere);
  }

  /**
   * Wraps generated content in a cacheable plain-text response.
   */
  private function fileResponse(string $content, CacheableMetadata $cacheability): CacheableResponse {
    $response = new CacheableResponse($content, 200, [
      'Content-Type' => 'text/plain; charset=UTF-8',
    ]);
    $response->addCacheableDependency($cacheability);
    return $response;
  }

}
